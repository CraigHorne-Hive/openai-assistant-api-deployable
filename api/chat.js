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
    const bodyText = rawBody.toString();

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (err) {
      console.error("❌ Invalid JSON body:\n", bodyText);
      return res.status(400).json({ error: "Invalid JSON in request body." });
    }

    const { messages, threadId, assistantId } = body;

    if (!messages || !threadId || !assistantId) {
      return res.status(400).json({ error: "Missing required fields: messages, threadId or assistantId" });
    }

    // Step 1: Add user message to the thread
    const messageRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        role: "user",
        content: messages?.[messages.length - 1]?.content || "No message provided"
      })
    });

    if (!messageRes.ok) {
      const errText = await messageRes.text();
      throw new Error(`Failed to add message: ${errText}`);
    }

    // ⏳ Wait for message to register
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Create a run
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    const run = await runResponse.json();

    // Step 3: Poll run status until it's complete
    let runStatus = run.status;
    let finalRun = run;

    while (runStatus !== "completed" && runStatus !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${run.id}`, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2"
        }
      });

      finalRun = await statusResponse.json();
      runStatus = finalRun.status;
    }

    if (runStatus === "failed") {
      return res.status(500).json({ error: "Assistant run failed." });
    }

    // Step 4: Retrieve latest messages
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });

    const messagesData = await messagesResponse.json();
    const assistantMessages = messagesData.data.filter(msg => msg.role === "assistant");
    const lastMessage = assistantMessages.at(-1)?.content?.[0]?.text?.value || "No response.";

    console.log("✅ Final assistant response:", lastMessage);

    res.status(200).json({ role: "assistant", content: lastMessage });
  } catch (err) {
    console.error("🔥 Handler error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

