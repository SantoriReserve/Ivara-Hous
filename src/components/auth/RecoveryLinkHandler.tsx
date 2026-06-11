"use client";

import { useEffect } from "react";
import { ROUTES } from "@/lib/constants";

function hasRecoveryHash(hash: string): boolean {
  if (!hash || hash.length < 2) {
    return false;
  }

  const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  return (
    hashParams.get("type") === "recovery" ||
    hash.includes("type=recovery") ||
    hash.includes("type%3Drecovery")
  );
}

function hasAuthCallbackQuery(search: string): boolean {
  const params = new URLSearchParams(search);
  return (
    params.has("code") || (params.has("token_hash") && params.has("type"))
  );
}

function buildCallbackUrl(search: string): string {
  const callback = new URL(ROUTES.authCallback, window.location.origin);
  const params = new URLSearchParams(search);
  params.forEach((value, key) => {
    callback.searchParams.set(key, value);
  });

  if (!callback.searchParams.has("next")) {
    callback.searchParams.set("next", ROUTES.loginResetPassword);
  }

  return callback.toString();
}

/**
 * Supabase recovery emails may land on the Site URL (/) with tokens in the hash
 * fragment. The server never sees those params, so middleware cannot forward them.
 */
export function RecoveryLinkHandler() {
  useEffect(() => {
    const { pathname, search, hash } = window.location;

    if (hasAuthCallbackQuery(search) && pathname !== ROUTES.authCallback) {
      window.location.replace(buildCallbackUrl(search));
      return;
    }

    if (!hasRecoveryHash(hash)) {
      return;
    }

    if (pathname === ROUTES.loginResetPassword) {
      return;
    }

    window.location.replace(`${ROUTES.loginResetPassword}${hash}`);
  }, []);

  return null;
}
