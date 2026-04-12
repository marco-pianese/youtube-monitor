const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

export async function generateSummaries(videos) {
  const list = videos.map((v, i) =>
    `${i}. Canale: "${v.channel}" | Titolo: "${v.title}" | Descrizione: "${v.description || "N/A"}"`
  ).join("\n");

  const prompt = `Sei un assistente che genera riassunti di video YouTube in italiano.
Per ciascuno dei seguenti video, genera:
- "short": riassunto sintetico di 2-3 frasi in italiano sui punti chiave principali
- "detailed": riassunto dettagliato in italiano con ESATTAMENTE 4 sezioni. Ogni sezione deve avere un titolo breve (3-5 parole) seguito da due punti e poi il testo del paragrafo. Separa le sezioni con \\n\\n. Struttura: "Tema e contesto: [testo]\\n\\nPunti chiave: [testo]\\n\\nEsempi pratici: [testo]\\n\\nConclusioni: [testo]"

Rispondi SOLO con un array JSON valido senza testo aggiuntivo né backtick:
[{"index":0,"short":"...","detailed":"Tema e contesto: testo...\\n\\nPunti chiave: testo...\\n\\nEsempi pratici: testo...\\n\\nConclusioni: testo..."}]

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

Scrivi ESATTAMENTE 4 sezioni separate da una riga vuota. Ogni sezione inizia con un titolo breve (3-5 parole) seguito da due punti, poi il testo. Esempio formato:
"Tema e contesto: testo del paragrafo...

Punti chiave: testo del paragrafo...

Esempi e dati: testo del paragrafo...

Conclusioni e takeaway: testo del paragrafo..."

Scrivi solo le 4 sezioni, nessun altro testo.`;

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
