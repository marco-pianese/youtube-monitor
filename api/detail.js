import { kv } from "@vercel/kv";
import { generateDetailedSummary, generateSummaries } from "./summarizer.js";
import { getVideoById } from "./youtube.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const { videoId } = req.body || {};
  if (!videoId) return res.status(400).json({ error: "Missing videoId" });

  const detailCacheKey = `detail_${videoId}`;
  const shortCacheKey = `short_${videoId}`;

  const cachedDetail = await kv.get(detailCacheKey);
  const cachedShort = await kv.get(shortCacheKey);

  // Check monitor cache
  const monitorCache = await kv.get("videos_cache");
  let video = monitorCache?.videos?.find(v => v.id === videoId);

  // If not in monitor cache, fetch from YouTube
  if (!video) {
    try {
      video = await getVideoById(videoId);
    } catch (e) {
      console.error("YouTube fetch error:", e.message);
      return res.status(404).json({ error: "Video non trovato. Verifica che il link sia corretto." });
    }
  }

  if (!video) return res.status(404).json({ error: "Video non trovato." });

  let detailed = cachedDetail;
  let short = cachedShort || video.shortSummary || "";

  if (!detailed) {
    try {
      detailed = await generateDetailedSummary(video);
      await kv.set(detailCacheKey, detailed, { ex: 60 * 60 * 24 * 30 });

      if (monitorCache?.videos) {
        const videos = monitorCache.videos.map(v => v.id === videoId ? { ...v, detailedSummary: detailed } : v);
        await kv.set("videos_cache", { ...monitorCache, videos });
      }
    } catch (e) {
      return res.status(500).json({ error: "Errore generazione riassunto: " + e.message });
    }
  }

  if (!short) {
    try {
      const results = await generateSummaries([video]);
      short = results?.[0]?.short || "";
      await kv.set(shortCacheKey, short, { ex: 60 * 60 * 24 * 30 });
    } catch (e) {
      console.error("Short summary error:", e.message);
    }
  }

  res.status(200).json({
    detailed,
    short,
    title: video.title,
    channel: video.channel,
    thumb: video.thumb,
    duration: video.duration,
    url: video.url
  });
}
