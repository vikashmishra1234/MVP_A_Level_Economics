import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col items-center">
      <section className="text-center py-20 max-w-3xl">
        <h1 className="text-5xl font-extrabold text-gray-900">
          Learn Economics Smarter
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Practice A-Level Economics with adaptive quizzes, instant scoring, and
          a personalized dashboard to track your progress.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/quiz"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          >
            Start Quiz
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-gray-300 rounded-xl shadow hover:bg-gray-100 transition"
          >
            Dashboard
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl px-6 py-12">
        <div className="p-6 bg-white rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-gray-800">
            📚 Multiple-choice Questions
          </h2>
          <p className="mt-2 text-gray-600">
            Access hundreds of A-Level Economics MCQs to test your knowledge.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-gray-800">
            ✅ Automated Scoring
          </h2>
          <p className="mt-2 text-gray-600">
            Get instant feedback at the end of every quiz session.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-gray-800">
            📈 Adaptive Learning
          </h2>
          <p className="mt-2 text-gray-600">
            Questions get harder as you improve to keep you challenged.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-gray-800">
            🎯 Personalized Dashboard
          </h2>
          <p className="mt-2 text-gray-600">
            Track your level, score trends, and identify weak areas.
          </p>
        </div>
      </section>

      <footer className="py-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} Economics Learning Platform
      </footer>
    </main>
  );
}
