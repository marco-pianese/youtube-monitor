# YouTube Monitor

A personal, mobile-first web app to stay updated on the YouTube channels that matter to me — without the infinite scroll, algorithmic recommendations, and Shorts that YouTube's own interface pushes constantly.

## Why I Built This

YouTube's feed is designed to keep you watching, not to help you stay informed. I found myself wasting time scrolling through irrelevant content and Shorts just to check whether a creator I follow had published something new. I wanted a clean, distraction-free interface — optimized for mobile — that shows me only what I actually care about, with the option to get a detailed AI-generated summary before deciding whether a video is worth watching in full.

---

## Features

### Monitor
Displays videos published in the last N days by selected channels, sorted by date or by channel. Shorts and videos under ~3.5 minutes are automatically filtered out. Each video shows:
- Title, channel, duration, and publication date
- Raw YouTube description (no extra API cost)
- An on-demand **"Get details"** button that triggers an AI-generated summary

### Channels
Manage which channels to monitor, toggle them on/off individually, and set the monitoring window (3 to 30 days).

### Analyze
Paste any YouTube link to get a detailed AI-generated summary on demand — useful for videos outside the monitored channels.

---

## Architecture & Technical Decisions

### Stack
| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — no framework, optimized for mobile |
| Backend | Vercel Serverless Functions (Node.js, ES Modules) |
| Cache | Upstash Redis via `@vercel/kv` |
| Video data | YouTube Data API v3 |
| AI summaries | Anthropic Claude API (Sonnet) |

### Why Vanilla JS (No Framework)
This is a personal tool with a single-page structure and no complex state management needs. Vanilla JS keeps the bundle size at zero, the deploy simple, and the code readable without a build step. The tradeoff is less structure, which is acceptable for a project of this scope.

### Why Serverless (Vercel)
No server to maintain, scales to zero when unused, and the free tier covers personal use comfortably. All logic lives in short-lived functions inside `/api`.

### Sync Strategy: Two-Phase Caching
A key constraint is Vercel's 10-second execution limit on serverless functions. To stay well within it, the sync pipeline is deliberately lightweight:

1. **Full sync** — triggered once per day (first load of the day). Fetches videos from all enabled channels for the last N days, filters by duration, and caches the result in Redis. No AI calls involved.
2. **Incremental sync** — triggered on subsequent loads within the same day. Only checks for videos published today and merges them into the existing cache. Very fast.

This means the heavy YouTube API work is done once daily, and every subsequent refresh is nearly instant.

### On-Demand AI Summaries (No Batch Generation)
Earlier versions generated short AI summaries for every video during sync. This caused two problems: it pushed sync time over Vercel's 10s limit when channels published many videos in a week, and it wasted API credits on videos the user might never open.

The current approach generates summaries **only when explicitly requested** via the "Get details" button. The result is cached in Redis for 30 days, so a second request for the same video is free.

### Shorts Filtering
YouTube's search API does not allow filtering by duration directly in the search query for all cases. The current approach fetches video IDs via `search`, then calls `videos?part=contentDetails` in batches of 50 to retrieve actual durations, and filters out anything below `MIN_DURATION_SECONDS` (currently 200 seconds, ~3.5 minutes). This adds one extra API call per batch but eliminates Shorts reliably.

### Channel ID Management
All monitored channels have their YouTube channel IDs hardcoded in `config.js` after manual verification against official YouTube channel URLs and Wikidata. This avoids relying on the `forHandle` resolution API at runtime, which is slower and occasionally unreliable for channels that have changed their handle.

---

## Setup

### Prerequisites
- [GitHub](https://github.com) account
- [Vercel](https://vercel.com) account connected to GitHub
- [YouTube Data API v3](https://console.cloud.google.com) key
- [Anthropic API](https://console.anthropic.com) key
- [Upstash](https://upstash.com) Redis database (or Vercel KV, which uses Upstash under the hood)

### Environment Variables on Vercel

| Variable | Description |
|---|---|
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `KV_REST_API_URL` | Added automatically by Vercel KV |
| `KV_REST_API_TOKEN` | Added automatically by Vercel KV |

> **Note:** No API keys are stored in the codebase. All secrets are managed as Vercel environment variables and accessed via `process.env` at runtime.

### Deploy
1. Fork or upload this repository to GitHub
2. Import the project on Vercel
3. Add the environment variables listed above
4. Connect your Upstash Redis database to the project (Vercel KV)
5. Deploy

---

## Project Structure

```
/
├── api/
│   ├── config.js          # Default channels (with verified IDs) and constants
│   ├── sync.js            # Main sync endpoint — YouTube fetch + duration filter
│   ├── detail.js          # On-demand detailed summary endpoint
│   ├── summarizer.js      # Anthropic API wrapper (Sonnet, detailed only)
│   ├── settings.js        # Read/write settings to Redis
│   ├── youtube.js         # YouTube API helpers
│   └── youtube-proxy.js   # Proxy for client-side YouTube API calls
├── public/
│   └── index.html         # Single-page frontend
├── package.json
└── vercel.json
```

---

## Default Monitored Channels

| Channel | Category |
|---|---|
| The Bull | Personal Finance (IT) |
| Marco Casario EXTRA | Finance & Economics (IT) |
| justETF Italia | ETF Investing (IT) |
| Geopop | Science & Geopolitics (IT) |
| Will Media | Current Affairs (IT) |
| Ali Abdaal | Productivity & Business (EN) |
| Alex Hormozi | Entrepreneurship (EN) |

Channels can be toggled on/off or removed entirely from the Channels tab in the app.
