import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const thread = await openai.beta.threads.create();
    res.status(200).json({ threadId: thread.id });
  } catch (error) {
    console.error("Failed to create thread:", error);
    res.status(500).json({ error: "Failed to create thread" });
  }
}

