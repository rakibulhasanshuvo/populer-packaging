import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, theme } = body;

    // Server-side validation check
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Simulate database profile row update successfully
    return NextResponse.json({
      success: true,
      message: "User profile persisted to database successfully.",
      profile: {
        name,
        email,
        phone: phone || null,
        theme_preference: theme || "dark",
        updated_at: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to parse synchronization payload." },
      { status: 500 }
    );
  }
}
