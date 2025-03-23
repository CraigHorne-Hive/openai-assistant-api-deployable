import { buffer } from 'micro';

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const rawBody = await buffer(req);
    const { messages, threadId } = JSON.parse(rawBody.toString());

    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v1"
      },
      body: JSON.stringify({
        role: "user",
        content: messages[messages.length - 1].content
      })
    });

    const data = await response.json();
    const assistantMessage = data.content?.[0]?.text?.value || "No response from assistant.";

    res.status(200).json({ role: "assistant", content: assistantMessage });
  } catch (err) {
    console.error("Error in handler:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
