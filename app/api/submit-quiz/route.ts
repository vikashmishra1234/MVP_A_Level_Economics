// app/api/submit-quiz/route.ts
import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/dbConnect";
// import Question from "@/models/Question";
import User from "@/models/User";
import mongoose from "mongoose";
import Questions from "@/models/Questions";
import { connectDB } from "@/lib/db";



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userEmail, userName, answers, questionOrder, timeTakenSeconds } = body;

    if (!userEmail || !answers || !questionOrder) {
      console.log(userEmail)
      console.log(answers)
      console.log(questionOrder)
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const qids = Array.from(new Set(questionOrder));
    const qObjectIds = qids.map((id: any) => new mongoose.Types.ObjectId(id));
    const questions = await Questions.find({ _id: { $in: qObjectIds } }).lean();

    const qMap = new Map<string, any>();
    for (const q of questions) qMap.set(String(q._id), q);

    const perQuestion = questionOrder.map((qid: string) => {
      const q = qMap.get(qid);
      const selected = answers[qid] ?? null;
      const correctOpt = q?.options?.find((o: any) => o.isCorrect);
      const isCorrect = !!(correctOpt && selected && correctOpt.text === selected);
      const marks = isCorrect ? q.marks ?? 1 : 0;
      return {
        qId: q ? q._id : qid,
        questionText: q ? q.questionText : "Deleted question",
        topic: q ? q.topic : "unknown",
        difficulty: q ? q.difficulty : "medium",
        selected,
        isCorrect,
        marks,
      };
    });

    const totalMarks = perQuestion.reduce((s:any, r:any) => s + (r.marks ?? 0) + 0, 0);
    const maxMarks = perQuestion.reduce((s:any, r:any) => s + (r.marks ?? 1), 0); 

    const topicIncorrectCounts: Record<string, number> = {};
    for (const p of perQuestion) {
      if (!p.isCorrect) {
        topicIncorrectCounts[p.topic] = (topicIncorrectCounts[p.topic] || 0) + 1;
      }
    }

    const attempt = {
      attemptId: new mongoose.Types.ObjectId(),
      score: totalMarks,
      total: maxMarks,
      perQuestion,
      attemptedAt: new Date(),
    };

    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = new User({
        name: userName ?? userEmail.split("@")[0],
        email: userEmail,
        level: 1,
        attempts: [attempt],
        weakAreas: Object.entries(topicIncorrectCounts).map(([topic, cnt]) => ({ topic, incorrectCount: cnt })),
      });
    } else {
      user.attempts.push(attempt);

      const waMap: Record<string, number> = {};
      for (const w of user.weakAreas || []) waMap[w.topic] = w.incorrectCount || 0;
      for (const [topic, cnt] of Object.entries(topicIncorrectCounts)) {
        waMap[topic] = (waMap[topic] || 0) + cnt;
      }
      user.weakAreas = Object.entries(waMap)
        .map(([topic, incorrectCount]) => ({ topic, incorrectCount }))
        .sort((a, b) => b.incorrectCount - a.incorrectCount);
    }

    const N = 5;
    const lastAttempts = [...(user.attempts || [])].slice(-N);
    const avgPercent =
      lastAttempts.length === 0
        ? 0
        : lastAttempts.reduce((s, a) => s + (a.score / Math.max(1, a.total)) * 100, 0) / lastAttempts.length;

 
    const newLevel = Math.max(1, Math.min(10, Math.ceil(avgPercent / 25)));

    user.level = newLevel;

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        level: user.level,
        attempts: user.attempts,
        weakAreas: user.weakAreas,
      },
    });
  } catch (err) {
    console.error("submit-quiz error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
