import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const FPS = 30, DUR = 15;
const srv = http.createServer((q, r) => {
  let f = path.join('public', decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('public/') || f === 'public') f = 'public/index.html';
  fs.readFile(f, (e, d) => { if (e) { r.statusCode = 404; r.end(); return; }
    r.setHeader('content-type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream'); r.end(d); });
}).listen(8080);
const all = fs.readdirSync('public/anim').filter(f => /\.vrma$/i.test(f));
let names = ['clapping', 'jump', 'surprised', 'goodbye', 'relax'].map(p => all.find(f => f.toLowerCase().includes(p))).filter(Boolean);
if (names.length < 3) names = all.slice(0, 5);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage({ viewport: { width: 960, height: 540 } });
pg.on('pageerror', e => console.log('ERR', String(e).slice(0, 300)));
pg.on('console', m => { if (m.type() === 'error') console.log('CERR', m.text().slice(0, 300)); });
await pg.goto('http://localhost:8080/');
await pg.waitForFunction(() => window.setup, null, { timeout: 30000 });
await pg.evaluate(n => window.setup(n), names);
fs.mkdirSync('frames', { recursive: true });
for (let i = 0; i < FPS * DUR; i++) {
  const d = await pg.evaluate(t => window.renderAt(t), i / FPS);
  fs.writeFileSync(`frames/f${String(i).padStart(4, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
}
console.log('frames', FPS * DUR, names.join(','));
await b.close(); srv.close();
