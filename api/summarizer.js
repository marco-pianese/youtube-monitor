const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

export async function generateSummaries(videos) {
  const list = videos.map((v, i) =>
    `${i}. Canale: "${v.channel}" | Titolo: "${v.title}" | Descrizione: "${v.description || ""}"`
  ).join("\n");

  const prompt = `Sei un assistente che genera riassunti di video YouTube in italiano.
Per ciascuno dei seguenti video, genera:
- "short": riassunto sintetico di 2-3 frasi sui punti chiave, in italiano
- "detailed": riassunto dettagliato di 3-4 paragrafi separati da \\n\\n, in italiano, con i temi principali, contesto e conclusioni

Rispondi SOLO con un array JSON valido, senza testo aggiuntivo:
[{"index":0,"short":"...","detailed":"..."}]

Video:
${list}`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const d = await r.json();
  const text = d.content?.[0]?.text || "[]";
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}

export async function generateDetailedSummary(video) {
  const prompt = `Genera un riassunto dettagliato in italiano del seguente video YouTube.
Canale: "${video.channel}"
Titolo: "${video.title}"
Descrizione: "${video.description || ""}"

Scrivi 4-5 paragrafi ben strutturati che analizzino: il tema principale, i punti chiave trattati, il contesto, e le conclusioni o takeaway principali. Rispondi solo con il testo, senza titoli o intestazioni.`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const d = await r.json();
  return d.content?.[0]?.text || "";
}
