// Builds the site: wraps each src/*.html body in the shared head, navigation and footer.
// Run: node tools/build.mjs   (writes index.html, events.html, ... to the project root)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');

const LINKS = [
  ['events', 'events.html', 'Events'],
  ['team', 'team.html', 'Team'],
  ['about', 'about.html', 'About'],
  ['newsletter', 'newsletter.html', 'Newsletter'],
];

const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
export const btn = (label, href = '#', extra = '') =>
  `<a class="btn ${extra}" href="${href}"><span class="btn-label">${label}</span><span class="btn-go">${arrow}</span></a>`;

const head = ({ title, description }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="claude:viewport-fit-sides" content="cover">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="theme-color" content="#030303">
<script>(function(){var r=document.documentElement;r.classList.add('js');try{var t=localStorage.getItem('theme');if(t)r.setAttribute('data-theme',t);}catch(e){}})();</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@500;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/site.css">
</head>`;

const nav = (active) => `
<header class="nav at-top">
  <a class="mark" href="index.html" aria-label="USICT Cybersecurity Club, home"><span class="glyph" aria-hidden="true"><i></i><i></i></span>USICT Cybersec</a>
  <nav class="nav-links" aria-label="Main">
    ${LINKS.map(([k, h, l]) => `<a class="hide-sm" href="${h}"${k === active ? ' aria-current="page"' : ''}>${l}</a>`).join('\n    ')}
    <button class="theme-toggle" type="button" aria-label="Switch theme"></button>
    <span class="hide-sm">${btn('Join', 'team.html#join')}</span>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="drawer">Menu</button>
  </nav>
</header>
<div class="drawer" id="drawer">
  <a href="index.html">Home</a>
  ${LINKS.map(([, h, l]) => `<a href="${h}">${l}</a>`).join('\n  ')}
  <a href="team.html#join">Join</a>
</div>`;

const credits = `<p class="credits">Pictures: <a href="https://commons.wikimedia.org/wiki/File:Michelangelo_-_Creation_of_Adam_(cropped).jpg">“The Creation of Adam”</a> and two details by Michelangelo, <a href="https://creativecommons.org/publicdomain/mark/1.0/">public domain</a>, via Wikimedia Commons (the particle hands are sampled from it); <a href="https://commons.wikimedia.org/w/index.php?curid=35135529">“M4 Enigma machine, U-505”</a> by Daderot, <a href="https://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a>; <a href="https://commons.wikimedia.org/w/index.php?curid=95442354">“Steckerboard on Enigma Machine”</a> by School of Mathematics, University of Manchester, <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a>; <a href="https://commons.wikimedia.org/wiki/File:Enigma_Machine_Rotor_Variations_on_display_at_Bletchley_Park_in_2022.jpg">“Enigma Machine Rotor Variations, Bletchley Park”</a> by Vintage Fan 5678, <a href="https://creativecommons.org/licenses/by/4.0">CC BY 4.0</a>; <a href="https://commons.wikimedia.org/wiki/File:Wartime_photo_of_Colossus_10.png">“Wartime photo of Colossus 10”</a> (1945), <a href="https://creativecommons.org/publicdomain/mark/1.0/">public domain</a>; <a href="https://commons.wikimedia.org/w/index.php?curid=27160092">“Five Disk Cipher prototype by R. R. Landsberger”</a> by Daderot, <a href="https://creativecommons.org/publicdomain/zero/1.0/deed.en/">CC0</a>; <a href="https://commons.wikimedia.org/wiki/File:CipherDisk2000.jpg">“CipherDisk2000”</a> by Hubert Berberich, <a href="https://creativecommons.org/publicdomain/mark/1.0/">public domain</a>; <a href="https://commons.wikimedia.org/w/index.php?curid=1406914">“Punched card”</a> by Mutatis mutandis, <a href="https://creativecommons.org/licenses/by/2.5/">CC BY 2.5</a>; <a href="https://commons.wikimedia.org/wiki/File:IBM_card_storage.NARA.jpg">“IBM card storage”</a>, NARA, <a href="https://creativecommons.org/publicdomain/mark/1.0/">public domain</a>. All via Wikimedia Commons.</p>`;

const footer = `
<footer class="site-foot wrap" data-field="base">
  <div class="bigmark" aria-hidden="true"><i></i><i></i></div>
  <p class="bigword" aria-hidden="true">USICT Cybersec</p>
  <div class="foot-grid">
    <div><h3>Club</h3><ul><li><a href="about.html">About</a></li><li><a href="team.html">Team</a></li><li><a href="team.html#join">Join</a></li></ul></div>
    <div><h3>Happening</h3><ul><li><a href="events.html">Events</a></li><li><a href="index.html#flag">Today's flag</a></li><li><a href="newsletter.html">The Air Gap</a></li></ul></div>
    <div><h3>Elsewhere</h3><ul><li><a href="#">Instagram</a></li><li><a href="#">LinkedIn</a></li><li><a href="#">GitHub</a></li><li><a href="#">Discord</a></li></ul></div>
    <div><h3>This site</h3><ul><li><a href="inspiration.html">Inspiration board</a></li><li><a href="about.html#code">Code of conduct</a></li></ul></div>
    <div class="contact"><h3>Find us</h3><p>University School of Information, Communication and Technology, Guru Gobind Singh Indraprastha University, Sector 16C, Dwarka, New Delhi 110078.</p><p style="margin-top:.6rem">Flag Night is every Friday at 5:30 pm.</p></div>
  </div>
  <div class="foot-last">
    <p>© <span class="year">2026</span> USICT Cybersecurity Club. A student club. We only test systems we own or are invited to test.</p>
    <p>Names, dates and issues on this preview are sample content.</p>
  </div>
  ${credits}
</footer>`;

const scripts = `
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="assets/hands.js"></script>
<script src="js/scene.js"></script>
<script src="js/site.js"></script>`;

const loader = `
<div class="loader" aria-hidden="true">
  <div class="half l"></div><div class="half r"></div>
  <div class="tips"><i></i><i></i></div>
  <p class="count tnum">000</p>
  <p class="note">Establishing the air gap</p>
</div>`;

for (const file of readdirSync(SRC).filter((f) => f.endsWith('.html'))) {
  const raw = readFileSync(join(SRC, file), 'utf8');
  const m = raw.match(/^<!--([\s\S]*?)-->\s*/);
  const meta = Object.fromEntries((m ? m[1] : '').trim().split('\n').map((l) => l.split(/:\s*/)).map(([k, ...v]) => [k.trim(), v.join(': ').trim()]));
  let body = raw.slice(m ? m[0].length : 0);
  body = body.replace(/\{\{btn ([^|}]+)\|([^|}]+)(?:\|([^}]+))?\}\}/g, (_, l, h, x) => btn(l.trim(), h.trim(), (x || '').trim()));
  const html = `${head(meta)}
<body>
${meta.loader === 'yes' ? loader : ''}
<canvas id="stage" data-start="${meta.start || 'field'}" aria-hidden="true"></canvas>
${nav(meta.active)}
<main>
${body.trim()}
</main>
${footer}
${scripts}
</body>
</html>
`;
  writeFileSync(join(ROOT, file), html);
  console.log('built', file);
}
