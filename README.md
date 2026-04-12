# YouTube Monitor

Dashboard personale per monitorare canali YouTube con riassunti automatici generati da AI.

## Funzionalità

- **Monitor** — visualizza i video pubblicati negli ultimi N giorni dai canali selezionati, ordinati per data o per canale. Per ogni video è presente un riassunto sintetico automatico e un riassunto dettagliato on-demand.
- **Canali** — gestione dei canali da monitorare con toggle on/off e configurazione del periodo di monitoraggio.
- **Analizza** — incolla qualsiasi link YouTube per ottenere un riassunto sintetico e dettagliato del video.

## Tecnologie

- **Frontend** — HTML/CSS/JS puro, ottimizzato per mobile
- **Backend** — Vercel Serverless Functions (Node.js)
- **Cache** — Vercel KV (Redis) per ottimizzare le chiamate API
- **YouTube Data API v3** — per recuperare i video e filtrare gli Shorts (esclusi i video sotto i 3 minuti)
- **Anthropic Claude API** — Haiku per i riassunti brevi automatici, Sonnet per i riassunti dettagliati on-demand

## Logica di caching

- La prima volta che si apre l'app in un giorno viene fatta una sincronizzazione completa degli ultimi N giorni
- Nei refresh successivi della stessa giornata viene controllato solo il giorno corrente (incrementale)
- I riassunti dettagliati vengono generati solo su richiesta e cachati per 30 giorni

## Setup

### Prerequisiti

- Account [GitHub](https://github.com)
- Account [Vercel](https://vercel.com) collegato a GitHub
- Chiave [YouTube Data API v3](https://console.cloud.google.com)
- Chiave [Anthropic API](https://console.anthropic.com)
- Database Vercel KV (Redis) creato e collegato al progetto

### Variabili d'ambiente su Vercel

| Nome | Descrizione |
|------|-------------|
| `YOUTUBE_API_KEY` | Chiave YouTube Data API v3 |
| `ANTHROPIC_API_KEY` | Chiave Anthropic API |
| `KV_REST_API_URL` | Aggiunta automaticamente da Vercel KV |
| `KV_REST_API_TOKEN` | Aggiunta automaticamente da Vercel KV |

### Deploy

1. Fai fork o carica questo repository su GitHub
2. Importa il progetto su Vercel
3. Aggiungi le variabili d'ambiente
4. Collega il database Vercel KV al progetto
5. Deploy!
