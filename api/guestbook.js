// Buku tamu — Vercel Serverless Function (Node, ESM)
// Penyimpanan: Vercel KV (Upstash Redis). Tanpa KV, fungsi menjawab 501 dan halaman otomatis memakai penyimpanan lokal peramban.
import { kv } from '@vercel/kv';
const KEY = 'guestbook:entries';
const ready = () => !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!ready()) return res.status(501).json({ error: 'KV belum diatur' });
  if (req.method === 'GET') return res.status(200).json((await kv.get(KEY)) || []);
  if (req.method === 'POST') {
    const body = typeof req.body === 'object' && req.body ? req.body : {};
    const text = String(body.text || '').replace(/\s+/g, ' ').trim().slice(0, 200);
    const name = String(body.name || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (!text) return res.status(400).json({ error: 'kosong' });
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon';
    const first = await kv.set(`guestbook:rl:${ip}`, 1, { nx: true, ex: 30 });
    if (first === null) return res.status(429).json({ error: 'pelan-pelan: satu jejak per 30 detik' });
    const list = ((await kv.get(KEY)) || []).slice(0, 499);
    list.unshift({ id: id(), name, text, at: Date.now() });
    await kv.set(KEY, list);
    return res.status(200).json(list);
  }
  res.setHeader('Allow', 'GET, POST'); return res.status(405).end();
}
