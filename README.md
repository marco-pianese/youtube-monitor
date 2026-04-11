# YouTube Monitor

Dashboard per monitorare canali YouTube con riassunti automatici.

## Setup su Vercel

1. Fai fork o carica questo progetto su GitHub
2. Importa il repo su [vercel.com](https://vercel.com)
3. Nelle impostazioni del progetto su Vercel, aggiungi la variabile d'ambiente:
   - Nome: `YOUTUBE_API_KEY`
   - Valore: la tua chiave YouTube Data API v3
4. Deploy!

## Struttura

- `public/index.html` — frontend dell'app
- `api/youtube.js` — proxy serverless che chiama YouTube API
- `vercel.json` — configurazione routing Vercel
