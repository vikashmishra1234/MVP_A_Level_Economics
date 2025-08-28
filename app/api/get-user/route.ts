import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function GET(req: Request) {
  try {
      const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) return NextResponse.json({ success: false, error: "No email provided" }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email }).lean();
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("get-user error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
