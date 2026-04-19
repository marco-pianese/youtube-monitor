const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Generates a detailed on-demand summary for a single video using Claude Sonnet.
 * Called only when the user explicitly clicks "Forniscimi dettagli".
 * Result is cached in Redis for 30 days to avoid repeated API calls.
 */
export async function generateDetailedSummary(video) {
  const prompt = `Genera un riassunto dettagliato in italiano del seguente video YouTube.

Canale: "${video.channel}"
Titolo: "${video.title}"
Descrizione: "${video.description || "N/A"}"

Scrivi ESATTAMENTE 4 sezioni separate da una riga vuota. Ogni sezione inizia con un titolo breve (3-5 parole) seguito da due punti, poi il testo. Il testo di ogni sezione deve essere sostanzioso e informativo (3-5 frasi), non generico.

Formato richiesto:
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
  if (d.error) throw new Error(d.error.message || "Anthropic API error");
  return d.content?.[0]?.text || "";
}
