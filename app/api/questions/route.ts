import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Questions from "@/models/Questions";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (Array.isArray(body)) {
      const inserted = await Questions.insertMany(body);
      return NextResponse.json({ success: true, count: inserted.length, questions: inserted });
    } else {
      const newQuestion = new Questions(body);
      await newQuestion.save();
      return NextResponse.json({ success: true, question: newQuestion });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
