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
    await mongoose.connect(uri, { dbName: "pulse-memo-pro" });
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
