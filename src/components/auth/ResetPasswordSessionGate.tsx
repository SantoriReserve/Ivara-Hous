"use client";

import { type ReactNode, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants";

type ResetPasswordSessionGateProps = {
  serverHasUser: boolean;
  children: ReactNode;
  expiredFallback: ReactNode;
};

function hasRecoveryHash(): boolean {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) {
    return false;
  }

  const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  return (
    hashParams.get("type") === "recovery" ||
    hash.includes("type=recovery") ||
    hashParams.has("access_token")
  );
}

function hasAuthCallbackQuery(): boolean {
  const params = new URLSearchParams(window.location.search);
  return (
    params.has("code") || (params.has("token_hash") && params.has("type"))
  );
}

export function ResetPasswordSessionGate({
  serverHasUser,
  children,
  expiredFallback,
}: ResetPasswordSessionGateProps) {
  const [ready, setReady] = useState(serverHasUser);
  const [hasUser, setHasUser] = useState(serverHasUser);

  useEffect(() => {
    if (serverHasUser) {
      return;
    }

    if (hasAuthCallbackQuery()) {
      const callback = new URL(ROUTES.authCallback, window.location.origin);
      const params = new URLSearchParams(window.location.search);
      params.forEach((value, key) => {
        callback.searchParams.set(key, value);
      });
      if (!callback.searchParams.has("next")) {
        callback.searchParams.set("next", ROUTES.loginResetPassword);
      }
      window.location.replace(callback.toString());
      return;
    }

    if (!hasRecoveryHash()) {
      setReady(true);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let settled = false;

    const finish = (sessionExists: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      setHasUser(sessionExists);
      setReady(true);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        finish(true);
      }
    });

    void (async () => {
      const hashParams = new URLSearchParams(
        window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash
      );
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        finish(Boolean(data.session) && !error);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      finish(Boolean(session));
    })();

    const timeout = window.setTimeout(() => finish(false), 6000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [serverHasUser]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="font-sans text-sm text-gray-mid">Verifying your reset link…</p>
      </div>
    );
  }

  if (!hasUser) {
    return expiredFallback;
  }

  return children;
}
