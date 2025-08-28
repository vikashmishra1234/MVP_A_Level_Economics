"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Option = { text: string; isCorrect: boolean };
type Difficulty = "easy" | "medium" | "hard";

type Question = {
  _id: string;
  questionText: string;
  options: Option[];
  difficulty: Difficulty;
  topic: string;
  marks: number;
};

type AnswerMap = Record<string, string>; 
type CorrectMap = Record<string, boolean>;
const DIFF_ORDER: Difficulty[] = ["easy", "medium", "hard"];
const harder = (d: Difficulty): Difficulty => (d === "easy" ? "medium" : d === "medium" ? "hard" : "hard");
const easier = (d: Difficulty): Difficulty => (d === "hard" ? "medium" : d === "medium" ? "easy" : "easy");

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [sequence, setSequence] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [correct, setCorrect] = useState<CorrectMap>({});

  const [streak, setStreak] = useState(0);

  const QUIZ_SECONDS = 10 * 60;
  const [timeLeft, setTimeLeft] = useState(QUIZ_SECONDS);
  const [submitted, setSubmitted] = useState(false);

  const {data:session} = useSession()
  const router = useRouter()

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/get-questions", { method: "GET" });
        const data: Question[] = (await res.json()).questions;
   
        const clean = (data || []).filter(
          (q) =>
            q &&
            q._id &&
            q.questionText &&
            Array.isArray(q.options) &&
            q.options.length >= 2
        );
        setQuestions(clean);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setQuestions([]);
        setLoading(false);
      }
    })();
  }, []);

  const pools = useMemo(() => {
    const usedIds = new Set(sequence.map((q) => q._id));
    const by: Record<Difficulty, Question[]> = { easy: [], medium: [], hard: [] };
    for (const q of questions) {
      if (!usedIds.has(q._id)) by[q.difficulty].push(q);
    }
    return by;
  }, [questions, sequence]);

  useEffect(() => {
    if (!loading && sequence.length === 0 && questions.length > 0) {
      const start =
        pickFromPool(pools.medium) ??
        pickFromPool(pools.easy) ??
        pickFromPool(pools.hard);
      if (start) setSequence([start]);
    }
  }, [loading, questions, pools, sequence.length]);

  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, submitted]);

  const currentQuestion = sequence[currentIndex];

  function pickFromPool(pool?: Question[]): Question | undefined {
    if (!pool || pool.length === 0) return undefined;
    const i = Math.floor(Math.random() * pool.length);
    return pool[i];
  }

  function nextByDifficulty(target: Difficulty): Question | undefined {
    return (
      pickFromPool(pools[target]) ??
    
      (target === "hard"
        ? pickFromPool(pools.medium) ?? pickFromPool(pools.easy)
        : target === "easy"
        ? pickFromPool(pools.medium) ?? pickFromPool(pools.hard)
        : 
          pickFromPool(pools.hard) ?? pickFromPool(pools.easy))
    );
  }

  function decideNextQuestion(curr: Question, isCurrCorrect: boolean): Question | undefined {
    const prevDiff = curr.difficulty;
    let target: Difficulty = prevDiff;

    if (isCurrCorrect) {
      const newStreak = streak + 1;
      target = newStreak >= 2 ? harder(prevDiff) : prevDiff;
    } else {
      target = easier(prevDiff);
    }

    return nextByDifficulty(target) ?? nextByDifficulty(prevDiff);
  }

  const onSelect = (qid: string, optionText: string) => {
    setAnswers((m) => ({ ...m, [qid]: optionText }));
  };

  const isAnswerCorrect = (q: Question, answerText: string | undefined) => {
    if (!answerText) return false;
    const opt = q.options.find((o) => o.text === answerText);
    return !!opt?.isCorrect;
  };

  const handleNext = () => {
    if (!currentQuestion) return;
    const a = answers[currentQuestion._id];
    if (!a) return; 

    const currCorrect = isAnswerCorrect(currentQuestion, a);
    setCorrect((m) => ({ ...m, [currentQuestion._id]: currCorrect }));
    setStreak((s) => (currCorrect ? s + 1 : 0));

    if (currentIndex < sequence.length - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    const nextQ = decideNextQuestion(currentQuestion, currCorrect);
    if (nextQ) {
      setSequence((seq) => [...seq, nextQ]);
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
  };

  useEffect(() => {

    let s = 0;
    for (let i = Math.max(0, currentIndex - 1); i >= 0; i--) {
      const q = sequence[i];
      const ans = answers[q?._id ?? ""];
      if (!q || !ans) break;
      const ok = isAnswerCorrect(q, ans);
      if (ok) s += 1;
      else break;
    }
    setStreak(s);
  }, [currentIndex, sequence, answers]);

  const handleSubmit = async (auto = false) => {
    setSubmitted(true);

    const evaluated = sequence.map((q) => {
      const userAns = answers[q._id];
      const ok = isAnswerCorrect(q, userAns);
      return { q, userAns, ok, marks: ok ? q.marks : 0 };
    });

 
const payload = {
  userEmail: session?.user?.email, 
  userName: session?.user?.name,
  answers,
  questionOrder: sequence.map(q => q._id),
  timeTakenSeconds: QUIZ_SECONDS - timeLeft,
};

const res = await fetch("/api/submit-quiz", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const result = await res.json();
if (result.success) {
//  router.push('/dashboard')
} else {
  console.error("Submit failed:", result.error);
}


    const cm: CorrectMap = {};
    evaluated.forEach((r) => (cm[r.q._id] = r.ok));
    setCorrect(cm);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (loading) return <div className="p-4">Loading quiz…</div>;
  if (sequence.length === 0) return <div className="p-4">No questions available.</div>;

  if (submitted) {
    const totalMarks = sequence.reduce((sum, q) => sum + q.marks, 0);
    const scored = sequence.reduce(
      (sum, q) => sum + (correct[q._id] ? q.marks : 0),
      0
    );
    const accuracy =
      sequence.length > 0
        ? Math.round(
            (100 *
              sequence.filter((q) => correct[q._id]).length) /
              sequence.length
          )
        : 0;

    const topicMap: Record<
      string,
      { total: number; correct: number; marks: number; marksScored: number }
    > = {};
    for (const q of sequence) {
      topicMap[q.topic] ||= { total: 0, correct: 0, marks: 0, marksScored: 0 };
      topicMap[q.topic].total += 1;
      topicMap[q.topic].marks += q.marks;
      if (correct[q._id]) {
        topicMap[q.topic].correct += 1;
        topicMap[q.topic].marksScored += q.marks;
      }
    }

    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Session Summary</h2>
          <div className="text-sm px-3 py-1 rounded bg-gray-100">Time: {formatTime(QUIZ_SECONDS - timeLeft)}</div>
        </div>

        <div className="grid mb-8 grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat label="Questions" value={sequence.length.toString()} />
          <Stat label="Score" value={`${scored} / ${totalMarks}`} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
        </div>
        <Link className="bg-blue-600 rounded-lg text-white px-3 py-3 " href={'/dashboard'}>Continue to dashboard</Link>
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Topics</h3>
          <div className="space-y-2">
            {Object.entries(topicMap).map(([topic, t]) => (
              <div key={topic} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{topic}</div>
                  <div className="text-xs text-gray-600">
                    {t.correct}/{t.total} correct
                  </div>
                </div>
                <div className="text-sm">
                  Marks: {t.marksScored}/{t.marks}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Review</h3>
          <div className="space-y-3">
            {sequence.map((q, i) => {
              const ans = answers[q._id];
              const ok = correct[q._id];
              const correctText = q.options.find((o) => o.isCorrect)?.text ?? "";
              return (
                <div key={q._id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">Q{i + 1}. {q.questionText}</div>
                    <DiffBadge diff={q.difficulty} />
                  </div>
                  <div className="text-sm">
                    Your answer: <span className={ok ? "text-green-600" : "text-red-600"}>{ans ?? "—"}</span>
                    {!ok && correctText ? (
                      <span className="ml-2 text-gray-700">| Correct: {correctText}</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const selected = answers[currentQuestion._id];
  const progress = Math.round(((currentIndex + 1) / Math.max(1, sequence.length)) * 100);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-xl">Economics MCQ</div>
        <div className="flex items-center gap-2">
          <ProgressBar value={progress} />
          <div className="text-sm px-3 py-1 rounded bg-gray-100 font-mono">{formatTime(timeLeft)}</div>
        </div>
      </div>

      <div className="border rounded-2xl shadow p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">Question {currentIndex + 1}</div>
          <DiffBadge diff={currentQuestion.difficulty} />
        </div>
        <div className="font-semibold mb-4">{currentQuestion.questionText}</div>

        <div className="space-y-2">
          {currentQuestion.options.map((opt, idx) => (
            <label
              key={idx}
              className={`flex items-center gap-2 border rounded-lg p-2 cursor-pointer ${
                selected === opt.text ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <input
                type="radio"
                name={currentQuestion._id}
                value={opt.text}
                checked={selected === opt.text}
                onChange={() => onSelect(currentQuestion._id, opt.text)}
              />
              <span>{opt.text}</span><span className="text-red-500">{opt.isCorrect?"(correct)":"(incorrect)"}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-2xl bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
           

            {currentIndex === sequence.length - 1 && pools.easy.length + pools.medium.length + pools.hard.length === 0 ? (
              <button
                onClick={() => handleSubmit(false)}
                disabled={!selected}
                className="px-4 py-2 rounded-2xl bg-green-600 text-white disabled:opacity-50"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!selected}
                className="px-4 py-2 rounded-2xl bg-blue-600 text-white disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function DiffBadge({ diff }: { diff: Difficulty }) {
  const styles: Record<Difficulty, string> = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[diff]}`}>
      {diff.toUpperCase()}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-600"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-2xl p-4 text-center">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
