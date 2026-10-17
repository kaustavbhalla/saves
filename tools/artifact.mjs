// Packs the built site for a claude.ai artifact: the home page loses its document wrapper
// (the host adds one), other pages stay full documents, and links home point at home.html.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const pages = ['index', 'events', 'team', 'about', 'newsletter', 'inspiration'];
for (const p of pages) {
  let html = readFileSync(join(ROOT, p + '.html'), 'utf8').replace(/href="index\.html/g, 'href="home.html');
  if (p === 'index') {
    writeFileSync(join(OUT, 'home.html'), html);
    html = html
      .replace(/<!doctype html>\s*/i, '').replace(/<html[^>]*>\s*/i, '').replace(/<\/html>\s*/i, '')
      .replace(/<head>\s*/i, '').replace(/<\/head>\s*/i, '').replace(/<body>\s*/i, '').replace(/<\/body>\s*/i, '')
      .replace(/<meta charset="utf-8">\s*/i, '').replace(/<meta name="viewport"[^>]*>\s*/i, '');
    // the title must sit at the very top
    const t = html.match(/<title>.*?<\/title>\s*/)[0];
    html = t + html.replace(t, '');
  }
  writeFileSync(join(OUT, p + '.html'), html);
}
console.log('packed', OUT);
