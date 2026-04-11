<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>YouTube Monitor</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #ffffff;
    --bg2: #f5f5f3;
    --bg3: #ededea;
    --text: #1a1a18;
    --text2: #5a5a57;
    --text3: #999994;
    --border: rgba(0,0,0,0.1);
    --border2: rgba(0,0,0,0.18);
    --info-bg: #e6f1fb;
    --info-text: #0c447c;
    --danger-bg: #fcebeb;
    --danger-text: #a32d2d;
    --success-bg: #eaf3de;
    --success-text: #27500a;
    --radius: 8px;
    --radius-lg: 12px;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #1c1c1a;
      --bg2: #252523;
      --bg3: #2e2e2b;
      --text: #f0efea;
      --text2: #aaa99f;
      --text3: #6b6b66;
      --border: rgba(255,255,255,0.1);
      --border2: rgba(255,255,255,0.18);
      --info-bg: #042c53;
      --info-text: #b5d4f4;
      --danger-bg: #501313;
      --danger-text: #f7c1c1;
      --success-bg: #173404;
      --success-text: #c0dd97;
    }
  }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
  .app { max-width: 680px; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
  h1 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
  .subtitle { font-size: 14px; color: var(--text2); margin-bottom: 1.5rem; }
  .section-label { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
  .card { background: var(--bg); border: 0.5px solid var(--border); border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 12px; }
  .settings-panel { background: var(--bg2); border: 0.5px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.5rem; }
  input, select { width: 100%; padding: 10px 12px; border: 0.5px solid var(--border2); border-radius: var(--radius); font-size: 14px; background: var(--bg); color: var(--text); outline: none; font-family: inherit; -webkit-appearance: none; appearance: none; }
  input:focus, select:focus { border-color: var(--text2); box-shadow: 0 0 0 2px rgba(128,128,128,0.15); }
  select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
  .row { display: flex; gap: 8px; margin-bottom: 10px; }
  .row input { flex: 1; }
  .btn { padding: 10px 16px; border: 0.5px solid var(--border2); border-radius: var(--radius); font-size: 14px; font-weight: 500; cursor: pointer; background: var(--bg); color: var(--text); font-family: inherit; white-space: nowrap; transition: background 0.15s; }
  .btn:hover { background: var(--bg3); }
  .btn:active { transform: scale(0.98); }
  .btn-primary { background: var(--text); color: var(--bg); border-color: var(--text); width: 100%; margin-top: 4px; padding: 12px; font-size: 15px; }
  .btn-primary:hover { opacity: 0.88; background: var(--text); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .btn-sm { padding: 5px 12px; font-size: 12px; }
  .ch-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
  .ch-tag { display: flex; align-items: center; justify-content: space-between; background: var(--bg); border: 0.5px solid var(--border); border-radius: var(--radius); padding: 8px 12px; }
  .ch-left { display: flex; align-items: center; gap: 10px; }
  .ch-icon { width: 28px; height: 28px; border-radius: 50%; background: var(--info-bg); color: var(--info-text); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0; }
  .ch-name { font-size: 14px; }
  .ch-ok { font-size: 11px; color: var(--success-text); background: var(--success-bg); padding: 2px 6px; border-radius: 4px; }
  .ch-rm { background: none; border: none; cursor: pointer; color: var(--text3); font-size: 20px; line-height: 1; padding: 0 2px; }
  .ch-rm:hover { color: var(--danger-text); }
  .controls-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 12px 0 16px; }
  .controls-row label { font-size: 13px; color: var(--text2); white-space: nowrap; }
  .controls-row select { width: auto; flex: 1; min-width: 100px; }
  .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 1rem; }
  .stat { background: var(--bg2); border-radius: var(--radius); padding: 10px 12px; }
  .stat-label { font-size: 11px; color: var(--text3); margin-bottom: 2px; }
  .stat-val { font-size: 20px; font-weight: 600; }
  .last-update { font-size: 11px; color: var(--text3); text-align: right; margin-bottom: 12px; }
  .vcard { background: var(--bg); border: 0.5px solid var(--border); border-radius: var(--radius-lg); padding: 1rem; margin-bottom: 12px; }
  .vcard-top { display: flex; gap: 12px; margin-bottom: 10px; }
  .thumb { width: 110px; height: 62px; border-radius: var(--radius); object-fit: cover; flex-shrink: 0; background: var(--bg3); border: 0.5px solid var(--border); }
  .vcard-info { flex: 1; min-width: 0; }
  .ch-badge { display: inline-block; background: var(--info-bg); color: var(--info-text); font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; margin-bottom: 5px; }
  .vtitle { font-size: 14px; font-weight: 600; line-height: 1.35; margin-bottom: 3px; }
  .vmeta { font-size: 11px; color: var(--text3); }
  .vshort { font-size: 13px; color: var(--text2); line-height: 1.6; margin-bottom: 10px; }
  .vshort.loading { color: var(--text3); font-style: italic; }
  .vfull { font-size: 13px; color: var(--text2); line-height: 1.7; border-top: 0.5px solid var(--border); padding-top: 10px; margin-top: 4px; display: none; }
  .vfull p { margin-bottom: 8px; }
  .vactions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .watch-link { display: inline-block; font-size: 12px; color: var(--info-text); text-decoration: none; padding: 5px 12px; border: 0.5px solid var(--info-text); border-radius: var(--radius); background: var(--info-bg); }
  .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid var(--border2); border-top-color: var(--text); border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 6px; vertical-align: middle; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .msg { font-size: 14px; color: var(--text2); text-align: center; padding: 2rem; background: var(--bg2); border-radius: var(--radius-lg); }
  .err { font-size: 14px; color: var(--danger-text); background: var(--danger-bg); border-radius: var(--radius); padding: 10px 14px; margin-bottom: 12px; }
  .toggle-settings { font-size: 13px; color: var(--text2); background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 1rem; text-decoration: underline; }
  @media (max-width: 480px) {
    .thumb { width: 90px; height: 51px; }
    .vtitle { font-size: 13px; }
    .stats-row { grid-template-columns: repeat(3,1fr); }
  }
</style>
</head>
<body>
<div class="app">
  <h1>YouTube Monitor</h1>
  <p class="subtitle">Monitora i tuoi canali preferiti e ricevi riassunti automatici dei nuovi video.</p>

  <button class="toggle-settings" onclick="toggleSettings()">Impostazioni</button>

  <div class="settings-panel" id="settingsPanel">
    <p class="section-label" style="margin-bottom:10px;">Canali da monitorare</p>
    <div class="ch-list" id="chList"></div>
    <div class="row">
      <input type="text" id="chInput" placeholder="@NomeCanale o nome canale..." />
      <button class="btn" onclick="addChannel()">+ Aggiungi</button>
    </div>

    <div class="controls-row">
      <label>Ultimi</label>
      <select id="daysSelect">
        <option value="3">3 giorni</option>
        <option value="7" selected>7 giorni</option>
        <option value="10">10 giorni</option>
        <option value="14">14 giorni</option>
        <option value="30">30 giorni</option>
      </select>
      <label>Max video per canale</label>
      <select id="maxResults">
        <option value="3">3</option>
        <option value="5" selected>5</option>
        <option value="10">10</option>
      </select>
    </div>
  </div>

  <button class="btn btn-primary" id="refreshBtn" onclick="refresh()">Controlla video recenti</button>

  <div id="statsWrap" style="display:none; margin-top:1.5rem;">
    <div class="stats-row">
      <div class="stat"><div class="stat-label">Video trovati</div><div class="stat-val" id="sVideos">0</div></div>
      <div class="stat"><div class="stat-label">Canali attivi</div><div class="stat-val" id="sChannels">0</div></div>
      <div class="stat"><div class="stat-label">Periodo</div><div class="stat-val" id="sDays">7g</div></div>
    </div>
    <p class="last-update" id="lastUpdate"></p>
  </div>

  <div id="errorBox"></div>
  <div id="results" style="margin-top:1rem;"></div>
</div>

<script>
const PROXY = '/api/youtube';
const channels = JSON.parse(localStorage.getItem('yt_channels') || '[]');
let settingsOpen = true;

function saveChannels() { localStorage.setItem('yt_channels', JSON.stringify(channels)); }

function toggleSettings() {
  settingsOpen = !settingsOpen;
  document.getElementById('settingsPanel').style.display = settingsOpen ? 'block' : 'none';
  document.querySelector('.toggle-settings').textContent = settingsOpen ? 'Nascondi impostazioni' : 'Impostazioni';
}

function getInitials(name) {
  return name.replace(/^@/,'').split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
}

function addChannel() {
  const inp = document.getElementById('chInput');
  const val = inp.value.trim();
  if (!val || channels.find(c => c.raw === val)) { inp.value=''; return; }
  channels.push({ raw: val, id: null, name: val });
  inp.value = '';
  saveChannels();
  renderChannels();
}

document.getElementById('chInput').addEventListener('keydown', e => { if (e.key==='Enter') addChannel(); });

function removeChannel(i) { channels.splice(i,1); saveChannels(); renderChannels(); }

function renderChannels() {
  const el = document.getElementById('chList');
  if (!channels.length) { el.innerHTML = ''; return; }
  el.innerHTML = channels.map((ch,i) => `
    <div class="ch-tag">
      <div class="ch-left">
        <div class="ch-icon">${getInitials(ch.name)}</div>
        <span class="ch-name">${ch.name}</span>
        ${ch.id ? '<span class="ch-ok">trovato</span>' : ''}
      </div>
      <button class="ch-rm" onclick="removeChannel(${i})">×</button>
    </div>`).join('');
}

async function yt(endpoint, params) {
  const qs = new URLSearchParams({ endpoint, ...params }).toString();
  const r = await fetch(`${PROXY}?${qs}`);
  if (!r.ok) throw new Error(`Errore API: ${r.status}`);
  return r.json();
}

async function resolveChannel(raw) {
  const q = raw.startsWith('@') ? raw.slice(1) : raw;
  if (raw.startsWith('@')) {
    try {
      const d = await yt('channels', { part: 'snippet', forHandle: q });
      if (d.items?.length) return { id: d.items[0].id, name: d.items[0].snippet.title };
    } catch {}
  }
  const d2 = await yt('search', { part: 'snippet', type: 'channel', q, maxResults: 1 });
  if (!d2.items?.length) return null;
  const chId = d2.items[0].snippet.channelId;
  const d3 = await yt('channels', { part: 'snippet', id: chId });
  return { id: chId, name: d3.items?.[0]?.snippet?.title || raw };
}

async function getVideos(channelId, days, maxResults) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const d = await yt('search', { part: 'snippet', channelId, type: 'video', order: 'date', publishedAfter: since, maxResults });
  return (d.items || []).map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    published: new Date(item.snippet.publishedAt),
    thumb: item.snippet.thumbnails?.medium?.url || '',
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`
  }));
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 3600) return `${Math.floor(s/60)} min fa`;
  if (s < 86400) return `${Math.floor(s/3600)} ore fa`;
  return `${Math.floor(s/86400)} giorni fa`;
}

function showError(msg) {
  document.getElementById('errorBox').innerHTML = `<div class="err">${msg}</div>`;
}
function clearError() { document.getElementById('errorBox').innerHTML = ''; }

async function refresh() {
  if (!channels.length) { showError('Aggiungi almeno un canale.'); return; }
  clearError();
  const days = parseInt(document.getElementById('daysSelect').value);
  const maxResults = parseInt(document.getElementById('maxResults').value);
  const btn = document.getElementById('refreshBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Ricerca in corso...';
  document.getElementById('results').innerHTML = '<div class="msg"><span class="spinner"></span>Risolvo i canali...</div>';
  document.getElementById('statsWrap').style.display = 'none';

  try {
    for (let ch of channels) {
      if (!ch.id) {
        const res = await resolveChannel(ch.raw);
        if (res) { ch.id = res.id; ch.name = res.name; }
      }
    }
    saveChannels();
    renderChannels();

    document.getElementById('results').innerHTML = '<div class="msg"><span class="spinner"></span>Cerco i video recenti...</div>';

    const all = [];
    let active = 0;
    for (let ch of channels) {
      if (!ch.id) continue;
      const vids = await getVideos(ch.id, days, maxResults);
      if (vids.length) active++;
      all.push(...vids);
    }
    all.sort((a,b) => b.published - a.published);

    document.getElementById('sVideos').textContent = all.length;
    document.getElementById('sChannels').textContent = active;
    document.getElementById('sDays').textContent = days + 'g';
    document.getElementById('lastUpdate').textContent = 'Aggiornato: ' + new Date().toLocaleTimeString('it-IT');
    document.getElementById('statsWrap').style.display = 'block';

    if (!all.length) {
      document.getElementById('results').innerHTML = `<div class="msg">Nessun video negli ultimi ${days} giorni.</div>`;
    } else {
      renderVideos(all);
      requestSummaries(all);
    }
  } catch(e) {
    showError('Errore: ' + e.message);
    document.getElementById('results').innerHTML = '';
  }

  btn.disabled = false;
  btn.textContent = 'Controlla video recenti';
}

function renderVideos(videos) {
  document.getElementById('results').innerHTML = videos.map((v,i) => `
    <div class="vcard">
      <div class="vcard-top">
        ${v.thumb ? `<img class="thumb" src="${v.thumb}" alt="" loading="lazy" />` : ''}
        <div class="vcard-info">
          <span class="ch-badge">${v.channel}</span>
          <p class="vtitle">${v.title}</p>
          <p class="vmeta">${timeAgo(v.published)} · ${v.published.toLocaleDateString('it-IT')}</p>
        </div>
      </div>
      <p class="vshort loading" id="short-${i}">Generazione riassunto...</p>
      <div class="vfull" id="full-${i}"></div>
      <div class="vactions">
        <button class="btn btn-sm" id="detBtn-${i}" onclick="toggleFull(${i})">Dettaglio</button>
        <a class="watch-link" href="${v.url}" target="_blank">Guarda su YouTube →</a>
      </div>
    </div>`).join('');
}

function requestSummaries(videos) {
  const list = videos.map((v,i) => `${i}. [${v.channel}] "${v.title}"`).join('\n');
  const prompt = `YOUTUBE_SUMMARIES_REQUEST\nPer ciascuno dei seguenti video YouTube, fornisci un riassunto basandoti su titolo e canale. Rispondi SOLO con JSON:\n\`\`\`json\n{"summaries":[{"index":0,"short":"2-3 frasi punti chiave","detailed":"3-4 paragrafi separati da \\n\\n"}]}\n\`\`\`\nVideo:\n${list}`;
  if (typeof sendPrompt === 'function') sendPrompt(prompt);
}

function toggleFull(i) {
  const el = document.getElementById(`full-${i}`);
  const btn = document.getElementById(`detBtn-${i}`);
  const open = el.style.display === 'block';
  el.style.display = open ? 'none' : 'block';
  btn.textContent = open ? 'Dettaglio' : 'Nascondi';
}

window.addEventListener('message', e => {
  const text = e.data?.text || e.data?.content || '';
  if (!text.includes('YOUTUBE_SUMMARIES_REQUEST')) return;
  const m = text.match(/```json\s*([\s\S]*?)```/);
  if (!m) return;
  try {
    const p = JSON.parse(m[1]);
    (p.summaries||[]).forEach(s => {
      const sh = document.getElementById(`short-${s.index}`);
      const fu = document.getElementById(`full-${s.index}`);
      if (sh) { sh.textContent = s.short||''; sh.classList.remove('loading'); }
      if (fu) fu.innerHTML = (s.detailed||'').split('\n\n').map(p=>`<p>${p}</p>`).join('');
    });
  } catch {}
});

renderChannels();
</script>
</body>
</html>
