"use client";

import { useState } from "react";

export default function AddQuestionPage() {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [difficulty, setDifficulty] = useState("medium");
  const [topic, setTopic] = useState("");
  const [marks, setMarks] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (index: number, field: string, value: any) => {
    const newOptions = [...options];
    (newOptions as any)[index][field] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionText, options, difficulty, topic, marks }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("Question added successfully!");
      setQuestionText("");
      setOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
      setTopic("");
      setMarks(1);
    } else {
      alert("Error: " + data.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Question</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter question text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <div>
          <label className="font-medium">Options:</label>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder={`Option ${i + 1}`}
                value={opt.text}
                onChange={(e) => handleOptionChange(i, "text", e.target.value)}
                className="flex-1 p-2 border rounded"
                required
              />
              <input
                type="checkbox"
                checked={opt.isCorrect}
                onChange={(e) =>
                  handleOptionChange(i, "isCorrect", e.target.checked)
                }
              />
              <span>Correct</span>
            </div>
          ))}
        </div>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <input
          type="text"
          placeholder="Topic (e.g. Microeconomics)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          placeholder="Marks"
          value={marks}
          onChange={(e) => setMarks(Number(e.target.value))}
          className="w-full p-2 border rounded"
          min={1}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Add Question"}
        </button>
      </form>
    </div>
  );
}
