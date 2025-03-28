export default async function handler(req, res) {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  // Allow POST only
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Set CORS headers for the actual POST request
  res.setHeader("Access-Control-Allow-Origin", "*");

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

