import { kv } from "@vercel/kv";
import { generateDetailedSummary } from "./summarizer.js";
import { getVideoById } from "./youtube.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const { videoId } = req.body || {};
  if (!videoId) return res.status(400).json({ error: "Missing videoId" });

  const detailCacheKey = `detail_${videoId}`;

  // Check Redis cache first — avoid regenerating if already done (cached 30 days)
  const cachedDetail = await kv.get(detailCacheKey);
  if (cachedDetail) {
    // Still need video metadata for the response
    const monitorCache = await kv.get("videos_cache");
    let video = monitorCache?.videos?.find(v => v.id === videoId);
    if (!video) {
      try { video = await getVideoById(videoId); } catch {}
    }
    return res.status(200).json({
      detailed: cachedDetail,
      title: video?.title || "",
      channel: video?.channel || "",
      thumb: video?.thumb || "",
      duration: video?.duration || "",
      url: video?.url || `https://www.youtube.com/watch?v=${videoId}`
    });
  }

  // Fetch video metadata from monitor cache or YouTube API
  const monitorCache = await kv.get("videos_cache");
  let video = monitorCache?.videos?.find(v => v.id === videoId);

  if (!video) {
    try {
      video = await getVideoById(videoId);
    } catch (e) {
      console.error("YouTube fetch error:", e.message);
      return res.status(404).json({ error: "Video non trovato. Verifica che il link sia corretto." });
    }
  }

  if (!video) return res.status(404).json({ error: "Video non trovato." });

  // Generate detailed summary via Anthropic
  let detailed = "";
  try {
    detailed = await generateDetailedSummary(video);

    // Cache in Redis for 30 days
    await kv.set(detailCacheKey, detailed, { ex: 60 * 60 * 24 * 30 });

    // Also update the monitor cache so the detail is shown without re-fetching
    if (monitorCache?.videos) {
      const videos = monitorCache.videos.map(v =>
        v.id === videoId ? { ...v, detailedSummary: detailed } : v
      );
      await kv.set("videos_cache", { ...monitorCache, videos });
    }
  } catch (e) {
    return res.status(500).json({ error: "Errore generazione riassunto: " + e.message });
  }

  res.status(200).json({
    detailed,
    title: video.title,
    channel: video.channel,
    thumb: video.thumb,
    duration: video.duration,
    url: video.url
  });
}
