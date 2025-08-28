import mongoose, { Schema, Document } from "mongoose";

type Difficulty = "easy" | "medium" | "hard";

interface IPerQuestion {
  qId: mongoose.Types.ObjectId;
  questionText: string;
  topic: string;
  difficulty: Difficulty;
  selected?: string;
  isCorrect?: boolean;
  marks: number;
}

interface IAttempt {
  attemptId: mongoose.Types.ObjectId;
  score: number;            
  total: number;            
  perQuestion: IPerQuestion[];
  attemptedAt: Date;
}

export interface IUser extends Document {
  name?: string;
  email: string;
  password:string;
  level: number;
  attempts: IAttempt[];
  weakAreas: { topic: string; incorrectCount: number }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const PerQuestionSchema = new Schema({
  qId: { type: Schema.Types.ObjectId, required: true },
  questionText: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  selected: { type: String },
  isCorrect: { type: Boolean },
  marks: { type: Number, required: true },
});

const AttemptSchema = new Schema({
  attemptId: { type: Schema.Types.ObjectId, required: true, default: () => new mongoose.Types.ObjectId() },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  perQuestion: { type: [PerQuestionSchema], default: [] },
  attemptedAt: { type: Date, default: () => new Date() },
});

const UserSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password:{type:String,required:true},
    level: { type: Number, default: 1 },
    attempts: { type: [AttemptSchema], default: [] },
    weakAreas: { type: [{ topic: String, incorrectCount: Number }], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
