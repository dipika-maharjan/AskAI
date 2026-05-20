import express from "express";
import Thread from "../models/Thread.js";
import { getOpenAIAPIResponse } from "../utils/openai.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/thread", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const threads = await Thread.find({ userId }).sort({ updatedAt: -1 });
    res.json(threads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch threads" });
  }
});

router.get("/thread/:threadId", auth, async (req, res) => {
  const { threadId } = req.params;
  try {
    const userId = req.user.id;
    const thread = await Thread.findOne({ userId, threadId });
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    return res.json(thread.messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch chat" });
  }
});

router.delete("/thread/:threadId", auth, async (req, res) => {
  const { threadId } = req.params;
  try {
    const userId = req.user.id;
    const deletedThread = await Thread.findOneAndDelete({ userId, threadId });
    if (!deletedThread) return res.status(404).json({ error: "Thread not found" });
    return res.status(200).json({ success: "Thread deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete thread" });
  }
});

router.post("/chat", auth, async (req, res) => {
  const { threadId, message } = req.body;
  if (!threadId || !message) return res.status(400).json({ error: "missing required field" });

  const userId = req.user.id;

  try {
    const assistantReply = await getOpenAIAPIResponse(message);

    const userMsg = { role: "user", content: message, timestamp: new Date() };
    const assistantMsg = { role: "assistant", content: assistantReply, timestamp: new Date() };

    const thread = await Thread.findOneAndUpdate(
      { userId, threadId },
      {
        $setOnInsert: {
          threadId,
          title: (typeof message === 'string' && message.length) ? message.slice(0, 120) : 'New Thread',
          userId
        },
        $set: { updatedAt: new Date() },
        $push: { messages: { $each: [userMsg, assistantMsg] } }
      },
      { upsert: true, new: true }
    );

    return res.json({ reply: assistantReply, threadId: thread.threadId });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "Thread already exists." });
    }
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
});

export default router;