// models/Question.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  marks: number;
}

const QuestionSchema: Schema = new Schema(
  {
    questionText: {
      type: String,
      required: true,
    },
    options: [
      {
        text: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    topic: {
      type: String,
      required: true,
    },
    marks: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);
