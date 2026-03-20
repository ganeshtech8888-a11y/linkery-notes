import { Router, type IRouter } from "express";
import { inMemoryStore, isMongoConnected, MemoModel } from "../lib/mongo";

const router: IRouter = Router();

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

async function fetchPageTitle(url: string): Promise<{ title: string; favicon: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0" } });
    clearTimeout(timeout);
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().slice(0, 100) : new URL(url).hostname;
    const parsedUrl = new URL(url);
    const favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;
    return { title, favicon };
  } catch {
    try {
      return { title: new URL(url).hostname, favicon: "" };
    } catch {
      return { title: url.slice(0, 60), favicon: "" };
    }
  }
}

router.get("/memos", async (req, res) => {
  try {
    if (isMongoConnected()) {
      const docs = await MemoModel.find().sort({ createdAt: -1 }).lean();
      const memos = docs.map((d: any) => ({
        id: d._id.toString(),
        url: d.url,
        title: d.title,
        context: d.context,
        favicon: d.favicon || "",
        createdAt: d.createdAt?.toISOString?.() || new Date().toISOString(),
      }));
      res.json(memos);
    } else {
      const memos = inMemoryStore.map((m) => ({
        id: m._id,
        url: m.url,
        title: m.title,
        context: m.context,
        favicon: m.favicon,
        createdAt: m.createdAt,
      }));
      res.json(memos);
    }
  } catch (err) {
    req.log.error({ err }, "Failed to get memos");
    res.status(500).json({ error: "Failed to fetch memos" });
  }
});

router.post("/memos", async (req, res) => {
  const { url, context } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  if (!context || typeof context !== "string") {
    res.status(400).json({ error: "Context is required" });
    return;
  }

  try {
    new URL(url);
  } catch {
    res.status(400).json({ error: "Invalid URL format. Please include http:// or https://" });
    return;
  }

  try {
    const { title, favicon } = await fetchPageTitle(url);

    if (isMongoConnected()) {
      const doc = await MemoModel.create({ url, title, context, favicon });
      res.status(201).json({
        id: doc._id.toString(),
        url: doc.url,
        title: doc.title,
        context: doc.context,
        favicon: doc.favicon || "",
        createdAt: (doc as any).createdAt?.toISOString?.() || new Date().toISOString(),
      });
    } else {
      const memo = {
        _id: generateId(),
        url,
        title,
        context,
        favicon,
        createdAt: new Date().toISOString(),
      };
      inMemoryStore.unshift(memo);
      res.status(201).json({
        id: memo._id,
        url: memo.url,
        title: memo.title,
        context: memo.context,
        favicon: memo.favicon,
        createdAt: memo.createdAt,
      });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to create memo");
    res.status(500).json({ error: "Failed to save memo" });
  }
});

router.delete("/memos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (isMongoConnected()) {
      const { Types } = await import("mongoose");
      if (!Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: "Memo not found" });
        return;
      }
      const result = await MemoModel.findByIdAndDelete(id);
      if (!result) {
        res.status(404).json({ error: "Memo not found" });
        return;
      }
      res.json({ success: true });
    } else {
      const idx = inMemoryStore.findIndex((m) => m._id === id);
      if (idx === -1) {
        res.status(404).json({ error: "Memo not found" });
        return;
      }
      inMemoryStore.splice(idx, 1);
      res.json({ success: true });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to delete memo");
    res.status(500).json({ error: "Failed to delete memo" });
  }
});

export default router;
