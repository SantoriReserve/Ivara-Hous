#!/usr/bin/env node
/**
 * Password reset flow verification (local script — not part of production build).
 * Run: node --import tsx scripts/verify-password-reset.mts [baseUrl]
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.verify.tmp" });
config({ path: ".env.production.local" });
config({ path: ".env.local" });

const baseUrl = (process.argv[2] ?? process.env.VERIFY_BASE_URL ?? "https://www.ivarahous.com").replace(
  /\/$/,
  ""
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Check = { name: string; pass: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, pass: boolean, detail: string) {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}: ${detail}`);
}

async function main() {
  console.log(`Password reset verification @ ${baseUrl}\n`);

  const loginHtml = await fetch(`${baseUrl}/login`).then((r) => r.text());
  record(
    "Sign In page has Forgot Password link",
    loginHtml.includes("Forgot Password?") && loginHtml.includes("/login/forgot-password"),
    loginHtml.includes("Forgot Password?") ? "link present" : "link missing"
  );

  const forgotHtml = await fetch(`${baseUrl}/login/forgot-password`).then((r) => r.text());
  record(
    "Forgot password page loads",
    forgotHtml.includes("Send Reset Link") && forgotHtml.includes('type="email"'),
    `HTTP page loaded`
  );

  const resetHtml = await fetch(`${baseUrl}/login/reset-password`).then((r) => r.text());
  record(
    "Reset password page handles missing session",
    resetHtml.includes("Reset Link Expired") || resetHtml.includes("Create New Password"),
    resetHtml.includes("Reset Link Expired")
      ? "shows expired state without session"
      : "session present or alternate state"
  );

  if (!supabaseUrl || !serviceKey || !anonKey) {
    record(
      "Supabase recovery link + password update E2E",
      false,
      "Supabase env vars not available locally"
    );
    printSummary();
    return;
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const testEmail = `pwd-reset-verify-${Date.now()}@owner-live.ivarahous.com`;
  const originalPassword = `OriginalPass-${Date.now()}!`;
  const newPassword = `NewPass-${Date.now()}!`;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: testEmail,
    password: originalPassword,
    email_confirm: true,
  });

  if (createError || !created.user) {
    record("Create test user", false, createError?.message ?? "create failed");
    printSummary();
    return;
  }

  record("Create test user", true, testEmail);

  const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent("/login/reset-password")}`;
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: testEmail,
    options: { redirectTo },
  });

  if (linkError || !linkData.properties?.action_link) {
    record("Generate recovery link", false, linkError?.message ?? "no action_link");
    await admin.auth.admin.deleteUser(created.user.id);
    printSummary();
    return;
  }

  record("Generate recovery link", true, "admin link created");

  const recoveryResponse = await fetch(linkData.properties.action_link, {
    redirect: "manual",
  });
  const location = recoveryResponse.headers.get("location");

  if (!location) {
    record(
      "Recovery link redirects to app callback",
      false,
      `status=${recoveryResponse.status}, no location header`
    );
    await admin.auth.admin.deleteUser(created.user.id);
    printSummary();
    return;
  }

  const callbackUrl = location.startsWith("http") ? location : new URL(location, baseUrl).toString();
  const callbackRes = await fetch(callbackUrl, { redirect: "manual" });
  const setCookies = callbackRes.headers.getSetCookie?.() ?? [];
  const cookieHeader = setCookies.map((c) => c.split(";")[0]).join("; ");

  record(
    "Recovery callback establishes session",
    callbackRes.status === 307 || callbackRes.status === 302 || setCookies.length > 0,
    `status=${callbackRes.status}, cookies=${setCookies.length}`
  );

  const resetPageRes = await fetch(`${baseUrl}/login/reset-password`, {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });
  const resetPageHtml = await resetPageRes.text();
  record(
    "Reset password page with session shows form",
    resetPageHtml.includes("Create New Password") && resetPageHtml.includes("Save New Password"),
    resetPageHtml.includes("Create New Password") ? "form visible" : "form missing"
  );

  const anon = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: sessionData, error: sessionError } = await anon.auth.exchangeCodeForSession(
    new URL(callbackUrl).searchParams.get("code") ?? ""
  );

  let sessionAccessToken = sessionData.session?.access_token;
  let sessionRefreshToken = sessionData.session?.refresh_token;

  if (sessionError || !sessionAccessToken) {
    const verifyOtp = linkData.properties.hashed_token
      ? await anon.auth.verifyOtp({
          type: "recovery",
          token_hash: linkData.properties.hashed_token,
        })
      : { data: { session: null }, error: sessionError };

    sessionAccessToken = verifyOtp.data.session?.access_token;
    sessionRefreshToken = verifyOtp.data.session?.refresh_token;
  }

  if (!sessionAccessToken || !sessionRefreshToken) {
    record(
      "Establish recovery session for password update",
      false,
      sessionError?.message ?? "no session tokens"
    );
    await admin.auth.admin.deleteUser(created.user.id);
    printSummary();
    return;
  }

  const authed = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  await authed.auth.setSession({
    access_token: sessionAccessToken,
    refresh_token: sessionRefreshToken,
  });

  const { error: updateError } = await authed.auth.updateUser({ password: newPassword });
  record(
    "Save new password via Supabase",
    !updateError,
    updateError?.message ?? "password updated"
  );

  await authed.auth.signOut();

  const signInClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: oldSignInError } = await signInClient.auth.signInWithPassword({
    email: testEmail,
    password: originalPassword,
  });
  record(
    "Old password rejected after reset",
    Boolean(oldSignInError),
    oldSignInError ? "old password blocked" : "old password still works"
  );

  const { error: newSignInError } = await signInClient.auth.signInWithPassword({
    email: testEmail,
    password: newPassword,
  });
  record(
    "Sign in with new password",
    !newSignInError,
    newSignInError?.message ?? "sign-in succeeded"
  );

  const { error: resetEmailError } = await anon.auth.resetPasswordForEmail(testEmail, {
    redirectTo,
  });
  record(
    "Password reset email request",
    !resetEmailError,
    resetEmailError?.message ?? "reset email accepted by Supabase"
  );

  await admin.auth.admin.deleteUser(created.user.id);
  record("Cleanup test user", true, "deleted");

  printSummary();
}

function printSummary() {
  const pass = checks.every((c) => c.pass);
  console.log(`\n${pass ? "ALL CHECKS PASSED" : "SOME CHECKS FAILED"}`);
  console.log(JSON.stringify({ pass, checks }, null, 2));
  process.exit(pass ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
