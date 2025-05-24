export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const mockResults = [
    {
      id: "file-001",
      name: "customer_data.csv",
      location: "s3://company-bucket/customers/",
      type: "csv",
      category: "PII",
      sensitivity: "high"
    },
    {
      id: "file-002",
      name: "employee_contracts.pdf",
      location: "s3://company-bucket/hr/",
      type: "pdf",
      category: "confidential",
      sensitivity: "medium"
    },
    {
      id: "file-003",
      name: "marketing_plan.docx",
      location: "s3://company-bucket/marketing/",
      type: "docx",
      category: "general",
      sensitivity: "low"
    }
  ];

  return res.status(200).json({
    status: "ready",
    results: mockResults
  });
}

