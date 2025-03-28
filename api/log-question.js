export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { question, source } = req.body;
    const timestamp = new Date().toISOString();

    console.log("📥 User Question Logged:", { question, source, timestamp });

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("❌ Failed to log question:", error);
    res.status(500).json({ error: "Failed to log question" });
  }
}

