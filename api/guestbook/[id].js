// Hapus atau sematkan satu jejak — hanya dengan kunci admin (env ADMIN_KEY), dipakai lewat curl/skrip, bukan dari halaman.
import { kv } from '@vercel/kv';
const KEY = 'guestbook:entries';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)) return res.status(501).json({ error: 'KV belum diatur' });
  const key = req.headers['x-admin-key'];
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'kunci admin salah' });
  const { id } = req.query; let list = (await kv.get(KEY)) || [];
  if (req.method === 'DELETE') list = list.filter(e => e.id !== id);
  else if (req.method === 'PATCH') { const pin = !!(req.body && req.body.pin); list = list.map(e => e.id === id ? { ...e, pin } : e); }
  else { res.setHeader('Allow', 'DELETE, PATCH'); return res.status(405).end(); }
  await kv.set(KEY, list); return res.status(200).json(list);
}
