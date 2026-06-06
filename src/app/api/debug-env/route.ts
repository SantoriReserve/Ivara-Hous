import { NextResponse } from "next/server";

/**
 * Temporary diagnostic endpoint — remove after verifying Vercel env vars.
 * Does NOT expose secret values.
 */
export async function GET() {
  const key = process.env.OPENAI_API_KEY;

  return NextResponse.json({
    hasOpenAIKey: typeof key === "string" && key.trim().length > 0,
    model: process.env.OPENAI_MODEL ?? null,
  });
}
