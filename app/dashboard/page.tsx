"use client";

import React, { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Trophy, Target, BookOpen, Star, AlertCircle, TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  // const { data:session } = useSession();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const {data:session,status} = useSession();

  const router = useRouter()

  useEffect(()=>{
    if(status==="unauthenticated"){
      alert("Please Login.")
      router.push('/login')
    }
  },[status])

  useEffect(() => {
    if (!session?.user?.email) return;
    (async () => {
      setLoading(true);
      const email = session?.user?.email
      const res = await fetch(`/api/get-user?email=${email}`);
      const data = await res.json();
      if (data.success) setUser(data.user);
      setLoading(false);
    })();
  }, [session]);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (!user) return <div className="p-6">No user data found.</div>;

  const attempts = user.attempts || [];

  const scoreTrends = attempts.map((a: any, idx: number) => ({
    name: new Date(a.attemptedAt || a.attemptedAt || a.attemptedAt).toLocaleDateString(),
    score: Math.round((a.score / Math.max(1, a.total)) * 100),
    attemptIndex: idx + 1,
  }));

  const currentLevel = user.level || 1;

  const N = 5;
  const lastAttempts = attempts.slice(-N);
  const rollingAvg =
    lastAttempts.length > 0
      ? lastAttempts.reduce((s: number, a: any) => s + (a.score / Math.max(1, a.total)) * 100, 0) / lastAttempts.length
      : 0;
  const progressToNext = Math.min(100, Math.max(0, (rollingAvg % 25) * 4));

  const totalQuestions = attempts.reduce((acc: number, a: any) => acc + (a.total || 0), 0);

  function computeStreak(attemptsList: any[]) {
    const days = new Set(attemptsList.map((a) => new Date(a.attemptedAt).toISOString().slice(0, 10)));
    let streak = 0;
    let d = new Date(); 
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (days.has(key)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return streak;
  }
  const streak = computeStreak(attempts);

  const weakAreas = (user.weakAreas || []).slice(0, 6);

  const topicMap: Record<string, { correct: number; total: number }> = {};
  for (const a of attempts) {
    for (const pq of a.perQuestion || []) {
      topicMap[pq.topic] = topicMap[pq.topic] || { correct: 0, total: 0 };
      topicMap[pq.topic].total += 1;
      if (pq.isCorrect) topicMap[pq.topic].correct += 1;
    }
  }
  const topicPerformance = Object.entries(topicMap).map(([topic, val]) => ({
    topic,
    correct: val.correct,
    total: val.total,
    percentage: Math.round((val.correct / val.total) * 100),
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
          <p className="text-gray-600 mb-4">AQA A-Level practice dashboard</p>
          <Link href="/quiz" className="bg-blue-600  text-white px-6 py-3 rounded">Start quiz</Link>
          <button onClick={async()=>{
            await signOut();
            router.push('/')
          }}  className="bg-red-600  text-white my-3 px-6 py-2 ml-2 rounded">logout</button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Level</div>
                <div className="text-2xl font-semibold">{`Level ${currentLevel}`}</div>
              </div>
              <Trophy className="h-7 w-7 text-blue-500" />
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div style={{ width: `${progressToNext}%` }} className="h-2 rounded-full bg-blue-600" />
              </div>
              <div className="text-xs text-gray-500 mt-1">Progress to next level</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Latest Score</div>
                <div className="text-2xl font-semibold">
                  {attempts.length ? Math.round((attempts[attempts.length - 1].score / Math.max(1, attempts[attempts.length - 1].total)) * 100) : 0}%
                </div>
              </div>
              <Target className="h-7 w-7 text-green-500" />
            </div>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Questions Answered</div>
                <div className="text-2xl font-semibold">{totalQuestions}</div>
              </div>
              <BookOpen className="h-7 w-7 text-purple-500" />
            </div>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Current Streak</div>
                <div className="text-2xl font-semibold">{streak} days</div>
              </div>
              <Star className="h-7 w-7 text-orange-500" />
            </div>
          </div>
        </section>

        <section className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Score Trends</h3>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          {scoreTrends.length ? (
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-gray-500">No attempts yet.</div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center mb-3">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <h4 className="font-semibold">Areas for Improvement</h4>
            </div>
            {weakAreas.length ? (
              <ul className="space-y-2">
                {weakAreas.map((w: any) => (
                  <li key={w.topic} className="flex justify-between items-center border rounded p-2">
                    <div>
                      <div className="font-medium">{w.topic}</div>
                      <div className="text-xs text-gray-500">{w.incorrectCount} incorrect answers</div>
                    </div>
                    <div className="text-sm font-semibold text-red-600">{w.incorrectCount}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">No weak areas yet — good start!</div>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow col-span-2">
            <h4 className="font-semibold mb-3">Topic performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topicPerformance.map((t) => (
                <div key={t.topic} className="border rounded p-3">
                  <div className="flex justify-between">
                    <div className="font-medium">{t.topic}</div>
                    <div className="font-semibold">{t.percentage}%</div>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div style={{ width: `${t.percentage}%` }} className={`h-2 rounded-full ${t.percentage >= 80 ? "bg-green-500" : t.percentage >= 70 ? "bg-yellow-500" : "bg-red-500"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex gap-4 justify-center">
          <Link href="/quiz" className="bg-blue-600 text-white px-6 py-3 rounded">Start quiz</Link>
         
        </div>
      </div>
    </div>
  );
}
