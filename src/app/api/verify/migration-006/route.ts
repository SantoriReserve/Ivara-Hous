import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("content_daily_pins").select("id").limit(1);

    if (error?.message.toLowerCase().includes("does not exist")) {
      return NextResponse.json(
        { pass: false, detail: "content_daily_pins table missing" },
        { status: 503 }
      );
    }

    if (error) {
      return NextResponse.json({ pass: false, detail: error.message }, { status: 500 });
    }

    return NextResponse.json({
      pass: true,
      detail: "Migration 006 applied — content_daily_pins accessible",
    });
  } catch (error) {
    return NextResponse.json(
      {
        pass: false,
        detail: error instanceof Error ? error.message : "Verification failed",
      },
      { status: 500 }
    );
  }
}
