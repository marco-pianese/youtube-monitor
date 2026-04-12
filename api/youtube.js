const YT_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY;

export async function resolveChannelId(handle) {
  const clean = handle.replace(/^@/, "");

  // Strategy 1: forHandle
  try {
    const r = await fetch(`${YT_BASE}/channels?part=snippet&forHandle=${encodeURIComponent(clean)}&key=${API_KEY}`);
    const d = await r.json();
    if (d.items?.length) return { id: d.items[0].id, name: d.items[0].snippet.title, thumb: d.items[0].snippet.thumbnails?.default?.url };
  } catch {}

  // Strategy 2: forUsername
  try {
    const r = await fetch(`${YT_BASE}/channels?part=snippet&forUsername=${encodeURIComponent(clean)}&key=${API_KEY}`);
    const d = await r.json();
    if (d.items?.length) return { id: d.items[0].id, name: d.items[0].snippet.title, thumb: d.items[0].snippet.thumbnails?.default?.url };
  } catch {}

  // Strategy 3: search
  try {
    const r = await fetch(`${YT_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(clean)}&maxResults=3&key=${API_KEY}`);
    const d = await r.json();
    if (d.items?.length) {
      const best = d.items.find(i => i.snippet.channelTitle.toLowerCase().includes(clean.toLowerCase())) || d.items[0];
      const chId = best.snippet.channelId;
      const r2 = await fetch(`${YT_BASE}/channels?part=snippet&id=${chId}&key=${API_KEY}`);
      const d2 = await r2.json();
      if (d2.items?.length) return { id: chId, name: d2.items[0].snippet.title, thumb: d2.items[0].snippet.thumbnails?.default?.url };
    }
  } catch {}

  return null;
}

export async function searchVideos(channelId, publishedAfter, maxResults = 10) {
  const r = await fetch(`${YT_BASE}/search?part=snippet&channelId=${channelId}&type=video&order=date&publishedAfter=${publishedAfter}&maxResults=${maxResults}&key=${API_KEY}`);
  const d = await r.json();
  return (d.items || []).map(i => ({
    id: i.id.videoId,
    title: i.snippet.title,
    channel: i.snippet.channelTitle,
    channelId: i.snippet.channelId,
    published: i.snippet.publishedAt,
    thumb: i.snippet.thumbnails?.medium?.url || "",
    url: `https://www.youtube.com/watch?v=${i.id.videoId}`
  }));
}

export async function getVideoDetails(videoIds) {
  if (!videoIds.length) return [];
  const ids = videoIds.join(",");
  const r = await fetch(`${YT_BASE}/videos?part=contentDetails,snippet&id=${ids}&key=${API_KEY}`);
  const d = await r.json();
  return (d.items || []).map(i => ({
    id: i.id,
    duration: parseDuration(i.contentDetails.duration),
    title: i.snippet.title,
    description: i.snippet.description?.slice(0, 800) || ""
  }));
}

export async function getVideoById(videoId) {
  const r = await fetch(`${YT_BASE}/videos?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`);
  const d = await r.json();
  if (!d.items?.length) return null;
  const item = d.items[0];
  return {
    id: videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    published: item.snippet.publishedAt,
    thumb: item.snippet.thumbnails?.medium?.url || "",
    url: `https://www.youtube.com/watch?v=${videoId}`,
    description: item.snippet.description?.slice(0, 800) || "",
    duration: formatDuration(parseDuration(item.contentDetails.duration))
  };
}

export function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}

export function formatDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${m}:${String(s).padStart(2,"0")}`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  res.status(200).json({ ok: true });
}
