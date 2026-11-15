// Builds the public privacy page (docs/privacy/index.html, served by GitHub Pages) from the
// same text the app shows (src/i18n/privacy.ts), so the website and the app never disagree.
// Usage: node store/privacy/build.cjs
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
const ts = require(path.join(root, 'node_modules', 'typescript'));

function load(file) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const m = { exports: {} };
  new Function('module', 'exports', 'require', js)(m, m.exports, () => ({}));
  return m.exports;
}

const { PRIVACY, PRIVACY_UPDATED, REVENUECAT_PRIVACY } = load('src/i18n/privacy.ts');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const langs = Object.keys(PRIVACY);

const sections = langs
  .map((l) => {
    const p = PRIVACY[l];
    const date = new Intl.DateTimeFormat(l, { day: 'numeric', month: 'long', year: 'numeric' }).format(PRIVACY_UPDATED);
    const body = p.s
      .map(([h, b], i) => `<h2>${esc(h)}</h2><p>${esc(b)}${i === 3 ? ` <a href="${REVENUECAT_PRIVACY}">RevenueCat</a>` : ''}</p>`)
      .join('\n');
    return `<section lang="${l}" id="${l}"${l === 'ar' ? ' dir="rtl"' : ''}>
<h1>${esc(p.title)}</h1>
<p class="date">${esc(p.updated)}: ${esc(date)}</p>
<p class="intro">${esc(p.intro)}</p>
${body}
</section>`;
  })
  .join('\n');

const options = langs.map((l) => `<option value="${l}">${esc(PRIVACY[l].title)} · ${l}</option>`).join('');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Christmas Countdown – Widget — Privacy Policy</title>
<style>
:root{color-scheme:light dark}
body{margin:0;font-family:-apple-system,system-ui,"Segoe UI",sans-serif;line-height:1.6;background:#0d3a1f;color:#fff}
main{max-width:720px;margin:0 auto;padding:24px 16px 64px}
header{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:8px}
.brand{font-weight:700;color:#f5c84c}
select{font:inherit;padding:6px 10px;border-radius:10px;border:0;max-width:100%}
h1{margin:.6em 0 .2em;font-size:1.9em;line-height:1.2}
h2{margin:1.6em 0 .3em;font-size:1.15em;color:#f5c84c}
.date{opacity:.7;margin:0}.intro{font-size:1.1em}
a{color:#f5c84c}
.js section{display:none}.js section.on{display:block}
</style></head><body><main>
<header><span class="brand">🎄 Christmas Countdown – Widget</span><select id="pick" aria-label="Language">${options}</select></header>
${sections}
</main>
<script>
document.documentElement.className='js';
var L=${JSON.stringify(langs)},pick=document.getElementById('pick');
function show(l){document.querySelectorAll('section').forEach(function(s){s.classList.toggle('on',s.id===l)});pick.value=l;document.documentElement.lang=l}
var h=location.hash.slice(1),n=(navigator.language||'en'),b=n.split('-')[0];
var want=L.indexOf(h)>=0?h:(/^zh-(TW|HK|MO|Hant)/i.test(n)?'zh-Hant':(b==='no'||b==='nn'?'nb':(L.indexOf(b)>=0?b:'en')));
show(want);pick.onchange=function(){show(pick.value);history.replaceState(null,'','#'+pick.value)};
</script></body></html>
`;

const out = path.join(root, 'docs', 'privacy', 'index.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('wrote', path.relative(root, out), `(${langs.length} languages)`);
