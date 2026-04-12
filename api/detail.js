import { kv } from "@vercel/kv";
import { generateDetailedSummary } from "./summarizer.js";
import { getVideoById } from "./youtube.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const { videoId, _video } = req.body || {};
  if (!videoId) return res.status(400).json({ error: "Missing videoId" });

  const cacheKey = `detail_${videoId}`;
  const cached = await kv.get(cacheKey);
  if (cached) return res.status(200).json({ detailed: cached });

  let video = _video;

  if (!video) {
    const cache = await kv.get("videos_cache");
    video = cache?.videos?.find(v => v.id === videoId);
  }

  if (!video) {
    try {
      video = await getVideoById(videoId);
    } catch (e) {
      console.error("YouTube fetch error:", e.message);
    }
  }

  if (!video) return res.status(404).json({ error: "Video non trovato" });

  try {
    const detailed = await generateDetailedSummary(video);
    await kv.set(cacheKey, detailed, { ex: 60 * 60 * 24 * 30 });

    const cache = await kv.get("videos_cache");
    if (cache?.videos) {
      const videos = cache.videos.map(v => v.id === videoId ? { ...v, detailedSummary: detailed } : v);
      await kv.set("videos_cache", { ...cache, videos });
    }

    res.status(200).json({ detailed });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
