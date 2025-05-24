export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Simulate scan status
  return res.status(200).json({ status: "completed", resultsAvailable: true });
}

