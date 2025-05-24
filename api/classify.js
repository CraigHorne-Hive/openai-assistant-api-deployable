export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { scannedFiles } = req.body;

    if (!Array.isArray(scannedFiles)) {
      return res.status(400).json({ error: "Missing or invalid scannedFiles" });
    }

    const classifiedFiles = scannedFiles.map(file => {
      let sensitivity = "low";
      let category = "general";

      const content = file.content.toLowerCase();

      if (content.includes("email") || content.includes("phone")) {
        sensitivity = "high";
        category = "PII";
      } else if (content.includes("confidential") || content.includes("contract")) {
        sensitivity = "medium";
        category = "confidential";
      }

      return {
        ...file,
        sensitivity,
        category
      };
    });

    return res.status(200).json({
      status: "classification-complete",
      classifiedFiles
    });

  } catch (err) {
    console.error("❌ Classification error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

