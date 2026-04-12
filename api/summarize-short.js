import { generateSummaries } from "./summarizer.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const { video } = req.body || {};
  if (!video) return res.status(400).json({ error: "Missing video" });

  try {
    const results = await generateSummaries([video]);
    const short = results?.[0]?.short || "";
    res.status(200).json({ short });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}