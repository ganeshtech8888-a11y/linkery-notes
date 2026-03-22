import mongoose from "mongoose";
import { logger } from "./logger";

let isConnected = false;

export async function connectMongo(): Promise<void> {
  if (isConnected) return;
  const uri = process.env.MONGO_URI;
  if (!uri) {
    logger.warn("MONGO_URI not set — using in-memory storage fallback");
    return;
  }
  try {
    await mongoose.connect(uri, { dbName: "linkery-notes" });
    isConnected = true;
    logger.info("Connected to MongoDB Atlas");
  } catch (err) {
    logger.error({ err }, "Failed to connect to MongoDB");
  }
}

const memoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    title: { type: String, required: true },
    context: { type: String, required: true },
    favicon: { type: String, default: "" },
  },
  { timestamps: true }
);

export const MemoModel =
  mongoose.models.Memo || mongoose.model("Memo", memoSchema);

export interface InMemoryMemo {
  _id: string;
  url: string;
  title: string;
  context: string;
  favicon: string;
  createdAt: string;
}

const inMemoryStore: InMemoryMemo[] = [];

export { inMemoryStore };
export function isMongoConnected(): boolean {
  return isConnected;
}

export async function seedWelcomeNote(): Promise<void> {
  if (!isConnected) return;
  try {
    const count = await MemoModel.countDocuments();
    if (count > 0) return;
    await MemoModel.create({
      url: "https://linkerynotes.app/welcome",
      title: "Welcome to Linkery Notes! 📝",
      context:
        "Your notes sync to the cloud. Save finance trackers, loan calculators, daily budgets, or any link worth remembering. Tap the + button to add your first link!",
      favicon: "https://www.google.com/s2/favicons?domain=linkerynotes.app&sz=64",
    });
    logger.info("Welcome note seeded");
  } catch (err) {
    logger.warn({ err }, "Could not seed welcome note");
  }
}
