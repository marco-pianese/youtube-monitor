import { kv } from "@vercel/kv";
import { resolveChannelId, searchVideos, getVideoDetails, formatDuration } from "./youtube.js";
import { DEFAULT_CHANNELS, DEFAULT_DAYS, MIN_DURATION_SECONDS } from "./config.js";

async function getSettings() {
  const settings = await kv.get("settings");
  return settings || { channels: DEFAULT_CHANNELS, days: DEFAULT_DAYS };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  try {
    const settings = await getSettings();
    const days = settings.days || DEFAULT_DAYS;
    const channels = settings.channels || DEFAULT_CHANNELS;

    const mergedChannels = channels.map(ch => {
      const def = DEFAULT_CHANNELS.find(d => d.handle === ch.handle);
      if (def?.id && !ch.id) return { ...ch, id: def.id };
      return ch;
    });

    const enabledChannels = mergedChannels.filter(c => c.enabled);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toISOString().split("T")[0];

    const cachedData = await kv.get("videos_cache") || {};
    const lastSync = await kv.get("last_sync");
    const lastSyncDate = lastSync ? lastSync.split("T")[0] : null;

    // ?force=1 bypasses cache and always does a full sync
    const forceSync = req.query?.force === "1";

    let videos = cachedData.videos || [];
    let needsFullSync = forceSync || !lastSyncDate || lastSyncDate !== todayKey;

    if (needsFullSync) {
      const since = new Date(Date.now() - days * 86400000).toISOString();
      videos = await fetchAllVideos(enabledChannels, since);
      await kv.set("videos_cache", { videos, syncedAt: new Date().toISOString() });
      await kv.set("last_sync", new Date().toISOString());
    } else {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const newVideos = await fetchAllVideos(enabledChannels, todayStart.toISOString());
      const existingIds = new Set(videos.map(v => v.id));
      const trulyNew = newVideos.filter(v => !existingIds.has(v.id));
      if (trulyNew.length) {
        const cutoff = new Date(Date.now() - days * 86400000);
        videos = [...trulyNew, ...videos].filter(v => new Date(v.published) >= cutoff);
        videos.sort((a, b) => new Date(b.published) - new Date(a.published));
        await kv.set("videos_cache", { videos, syncedAt: new Date().toISOString() });
        await kv.set("last_sync", new Date().toISOString());
      }
    }

    res.status(200).json({
      videos,
      syncedAt: new Date().toISOString(),
      wasFullSync: needsFullSync,
      days
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

async function fetchAllVideos(channels, since) {
  const resolvedChannels = await resolveChannels(channels);

  const results = await Promise.allSettled(
    resolvedChannels
      .filter(ch => ch.id)
      .map(async ch => {
        const raw = await searchVideos(ch.id, since, 50);
        console.log(`[sync] ${ch.name}: ${raw.length} videos found`);
        return raw;
      })
  );

  const allRaw = results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);

  if (!allRaw.length) return [];

  const ids = allRaw.map(v => v.id);
  const chunks = [];
  for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));

  const detailResults = await Promise.allSettled(
    chunks.map(chunk => getVideoDetails(chunk))
  );

  const details = detailResults
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);

  const detailMap = {};
  details.forEach(d => { detailMap[d.id] = d; });

  const filtered = allRaw
    .filter(v => {
      const det = detailMap[v.id];
      if (!det) return false;
      if (det.duration < MIN_DURATION_SECONDS) return false;
      return true;
    })
    .map(v => ({
      ...v,
      duration: formatDuration(detailMap[v.id]?.duration || 0),
      durationSecs: detailMap[v.id]?.duration || 0,
      description: detailMap[v.id]?.description || "",
      shortSummary: "",
      detailedSummary: ""
    }));

  const seen = new Set();
  const unique = filtered.filter(v => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });

  unique.sort((a, b) => new Date(b.published) - new Date(a.published));
  return unique;
}

async function resolveChannels(channels) {
  const cachedChannels = await kv.get("resolved_channels") || {};
  const resolved = [];

  for (const ch of channels) {
    if (ch.id) {
      resolved.push(ch);
      cachedChannels[ch.handle] = { id: ch.id, name: ch.name };
      continue;
    }
    if (cachedChannels[ch.handle]?.id) {
      resolved.push({ ...ch, ...cachedChannels[ch.handle] });
      continue;
    }
    try {
      const info = await resolveChannelId(ch.handle);
      if (info) {
        cachedChannels[ch.handle] = { id: info.id, name: info.name, thumb: info.thumb };
        resolved.push({ ...ch, id: info.id, name: info.name, thumb: info.thumb });
      } else {
        resolved.push(ch);
      }
    } catch {
      resolved.push(ch);
    }
  }

  await kv.set("resolved_channels", cachedChannels);
  return resolved;
}
