const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

export async function generateSummaries(videos) {
  const list = videos.map((v, i) =>
    `${i}. Canale: "${v.channel}" | Titolo: "${v.title}" | Descrizione: "${v.description || "N/A"}"`
  ).join("\n");

  const prompt = `Sei un assistente che genera riassunti di video YouTube in italiano.
Per ciascuno dei seguenti video, genera:
- "short": riassunto sintetico di 2-3 frasi in italiano sui punti chiave principali
- "detailed": riassunto dettagliato in italiano con ESATTAMENTE 4 paragrafi separati da \\n\\n. Ogni paragrafo deve trattare: 1) Tema principale e contesto, 2) Punti chiave e argomentazioni, 3) Esempi o casi pratici, 4) Conclusioni e takeaway

Rispondi SOLO con un array JSON valido senza testo aggiuntivo né backtick:
[{"index":0,"short":"...","detailed":"paragrafo1\\n\\nparagrafo2\\n\\nparagrafo3\\n\\nparagrafo4"}]

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
Descrizione: "${video.description || "N/A"}"

Scrivi ESATTAMENTE 4 paragrafi separati da una riga vuota, strutturati così:
- Paragrafo 1: Tema principale e contesto del video
- Paragrafo 2: Punti chiave e argomentazioni principali
- Paragrafo 3: Esempi concreti, dati o casi pratici trattati
- Paragrafo 4: Conclusioni, takeaway e perché vale la pena guardarlo

Scrivi solo i 4 paragrafi separati da riga vuota, senza titoli, senza numerazione, senza altro testo.`;

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
