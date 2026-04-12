import { kv } from "@vercel/kv";
import { DEFAULT_CHANNELS, DEFAULT_DAYS } from "./config.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  if (req.method === "GET") {
    const settings = await kv.get("settings");
    if (!settings) {
      const defaults = { channels: DEFAULT_CHANNELS, days: DEFAULT_DAYS };
      await kv.set("settings", defaults);
      return res.status(200).json(defaults);
    }
    return res.status(200).json(settings);
  }

  if (req.method === "POST") {
    const body = req.body;
    await kv.set("settings", body);
    await kv.del("videos_cache");
    await kv.del("last_sync");
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}

export async function getSettings() {
  const settings = await kv.get("settings");
  return settings || { channels: DEFAULT_CHANNELS, days: DEFAULT_DAYS };
}
