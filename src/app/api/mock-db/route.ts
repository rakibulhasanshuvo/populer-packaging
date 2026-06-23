import { NextResponse } from "next/server";
import { getMockDb, saveMockDb } from "@/lib/supabase/mockDb";

export async function GET() {
  const db = getMockDb();
  return NextResponse.json(db);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    saveMockDb(body);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
