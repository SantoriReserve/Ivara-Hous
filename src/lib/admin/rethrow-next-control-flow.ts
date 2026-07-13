import { isRedirectError } from "next/dist/client/components/redirect-error";

/** Re-throw Next.js control-flow errors so redirect()/notFound() still work inside try/catch. */
export function rethrowNextControlFlow(error: unknown): void {
  if (isRedirectError(error)) {
    throw error;
  }
}
