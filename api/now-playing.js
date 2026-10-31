// Sedang diputar — Spotify. Butuh env SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN.
// Tanpa env itu, fungsi menjawab 204 dan ubin di halaman memakai lagu cadangan dari CONTENT.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) return res.status(204).end();
  try {
    const tok = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }) }).then(r => r.json());
    const h = { Authorization: `Bearer ${tok.access_token}` };
    const shape = (t, playing, at, progress) => ({ title: t.name, artist: t.artists.map(a => a.name).join(', '), album: t.album && t.album.name, art: t.album && t.album.images && t.album.images[1] && t.album.images[1].url, url: t.external_urls && t.external_urls.spotify, duration: t.duration_ms, progress, playing, at });
    const cur = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers: h });
    if (cur.status === 200) { const j = await cur.json(); if (j && j.item && j.item.type === 'track') return res.status(200).json(shape(j.item, !!j.is_playing, Date.now(), j.progress_ms)); }
    const rec = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { headers: h }).then(r => r.json());
    const it = rec && rec.items && rec.items[0]; if (!it) return res.status(204).end();
    return res.status(200).json(shape(it.track, false, Date.parse(it.played_at), 0));
  } catch (e) { return res.status(204).end(); }
}
