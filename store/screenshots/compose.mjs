// Composes App Store screenshots (1320×2868, iPhone 6.9") in the Deer style:
// caption in the sky, the real app in a phone frame, a snowy landscape and a 3D
// character at the edge. Usage: node compose.mjs <playwright-core dir> [lang,lang…]
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const app = join(here, '..', '..');
const require = createRequire(join(process.argv[2], 'package.json'));
const { chromium } = require('playwright-core');
const ts = createRequire(join(app, 'package.json'))('typescript');
const data = JSON.parse(readFileSync(join(here, 'data.json'), 'utf8'));
const only = process.argv[3]?.split(',');
const LANGS = Object.keys(data).filter((k) => k !== '_' && (!only || only.includes(k)));

const url = (p) => pathToFileURL(join(app, p)).href;
const glyphs = JSON.parse(readFileSync(join(app, 'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json'), 'utf8'));
const glyph = (name) => String.fromCodePoint(glyphs[name]);
const URBANIST = ['en', 'fr', 'de', 'it', 'es', 'pt', 'nl', 'da', 'sv', 'nb', 'fi', 'pl', 'cs', 'sk', 'hu', 'ro', 'hr', 'ca', 'id', 'ms'];

function loadStrings(lang) {
  const src = readFileSync(join(app, 'src/i18n/locales', `${lang}.ts`), 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const m = { exports: {} };
  new Function('module', 'exports', 'require', js)(m, m.exports, () => ({}));
  return m.exports.default;
}

const SHOTS = [
  { n: 1, file: '01-countdown', tab: 0, char: ['deer', 'right'] },
  { n: 2, file: '02-advent', tab: null, char: ['snowman', 'left'] },
  { n: 3, file: '03-secret-santa', tab: 2, char: ['penguin', 'right'] },
  { n: 4, file: '04-naughty-nice', tab: 3, char: ['sled', 'left'] },
  { n: 5, file: '05-gift-list', tab: 4, char: ['gift', 'right'] },
  { n: 6, file: '06-premium', tab: 0, char: ['santa', 'right'], widget: true },
];
const TAB_ICONS = [['time-outline', 'time'], ['calendar-outline', 'calendar'], ['gift-outline', 'gift'], ['finger-print-outline', 'finger-print'], ['list-outline', 'list']];
const CHAR = { deer: 'deer.png', snowman: 'snowman.png', penguin: 'penguin.png', sled: 'sled.png', gift: 'wrapped_gift.png', santa: 'santa_claus.png' };

function html(lang, shot, s) {
  const d = data[lang];
  const [title, sub] = d.caps[shot.n - 1];
  const rtl = lang === 'ar';
  const font = URBANIST.includes(lang)
    ? "'Urbanist', 'Segoe UI', sans-serif"
    : "'Segoe UI', 'Nirmala UI', 'Yu Gothic UI', 'Malgun Gothic', 'Microsoft JhengHei UI', sans-serif";
  const tabs = [s.tabs.countdown, s.tabs.advent, s.tabs.santa, s.tabs.scanner, s.tabs.gifts];
  const [charName, side] = shot.char;
  return `<!doctype html><html dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@font-face{font-family:Urbanist;font-weight:800;src:url(${url('node_modules/@expo-google-fonts/urbanist/800ExtraBold/Urbanist_800ExtraBold.ttf')})}
@font-face{font-family:Urbanist;font-weight:600;src:url(${url('node_modules/@expo-google-fonts/urbanist/600SemiBold/Urbanist_600SemiBold.ttf')})}
@font-face{font-family:Urbanist;font-weight:500;src:url(${url('node_modules/@expo-google-fonts/urbanist/500Medium/Urbanist_500Medium.ttf')})}
@font-face{font-family:Ionicons;src:url(${url('node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf')})}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1320px;height:2868px;overflow:hidden}
body{position:relative;font-family:${font};color:#fff;background:linear-gradient(180deg,#2a6b3a 0%,#164a27 45%,#0b3018 100%)}
.grain{position:absolute;inset:0;background:url(${url('assets/ui/grain.png')});opacity:.9}
.glow{position:absolute;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,rgba(245,200,76,.22),rgba(245,200,76,0) 65%);${rtl ? 'left' : 'right'}:-260px;top:-260px}
.spark{position:absolute;background:url(${url('assets/ui/sparkle.png')}) center/contain no-repeat;opacity:.9}
.blur{position:absolute;background:url(${url('assets/ui/sparkle_blur.png')}) center/contain no-repeat;opacity:.55}
.head{position:absolute;top:150px;left:96px;right:96px;text-align:${rtl ? 'right' : 'left'}}
h1{font-weight:800;font-size:112px;line-height:1.04;letter-spacing:-1.5px}
p.sub{margin-top:30px;font-weight:500;font-size:50px;line-height:1.25;color:rgba(255,255,255,.8)}
.phone{position:absolute;left:210px;width:900px;height:1904px;border-radius:150px;background:#0b140e;padding:20px;box-shadow:0 60px 120px rgba(0,0,0,.45),0 0 0 4px #2f3a33 inset}
.screen{position:relative;width:860px;height:1864px;border-radius:130px;overflow:hidden;background:#1f5d31}
.status{position:absolute;top:0;left:0;right:0;height:118px;display:flex;align-items:center;justify-content:space-between;padding:20px 78px 0 96px;font-family:'Segoe UI',sans-serif;font-weight:600;font-size:36px;direction:ltr;z-index:3}
.island{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:252px;height:74px;border-radius:40px;background:#000;z-index:4}
.app{position:absolute;top:118px;left:0;width:860px}
.tabbar{position:absolute;left:36px;right:36px;bottom:44px;height:132px;border-radius:70px;background:rgba(10,38,21,.94);border:1.5px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:space-around;padding:0 10px;direction:ltr;z-index:3}
.tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:150px;height:112px;border-radius:56px;color:rgba(255,255,255,.88)}
.tab.on{background:rgba(0,0,0,.38);color:#f5c84c}
.tab i{font-family:Ionicons;font-style:normal;font-size:46px;line-height:52px}
.tab span{font-family:${font};font-weight:600;font-size:20px;white-space:nowrap;max-width:146px;overflow:hidden;text-overflow:ellipsis}
.land{position:absolute;left:0;right:0;bottom:0;height:640px}
.char{position:absolute;bottom:40px;width:380px;height:380px;background:center/contain no-repeat;filter:drop-shadow(0 24px 30px rgba(0,0,0,.35))}
.widget{position:absolute;left:40px;top:1990px;width:380px;height:380px;border-radius:84px;background:linear-gradient(135deg,#c8424b,#5c0e16);box-shadow:0 40px 80px rgba(0,0,0,.45);display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-5deg);direction:ltr}
.widget img{width:120px;height:120px}
.widget b{font-family:Georgia,serif;font-size:110px;line-height:1;font-weight:800}
.widget .l{font-family:${font};font-weight:700;font-size:26px;letter-spacing:3px;color:#f5c84c;text-transform:uppercase}
.widget .u{font-family:Georgia,serif;font-style:italic;font-size:30px;margin-top:4px;max-width:340px;text-align:center}
</style></head><body>
<div class="grain"></div><div class="glow"></div>
${[[90, 520, 34], [1180, 760, 44], [70, 1300, 30], [1230, 1450, 28], [150, 2050, 38], [1170, 2180, 30], [640, 110, 26]].map(([x, y, z]) => `<div class="spark" style="left:${x}px;top:${y}px;width:${z}px;height:${z}px"></div>`).join('')}
${[[1080, 980, 190], [-40, 860, 160], [1150, 1950, 170]].map(([x, y, z]) => `<div class="blur" style="left:${x}px;top:${y}px;width:${z}px;height:${z}px"></div>`).join('')}
<svg class="land" viewBox="0 0 1320 640" preserveAspectRatio="none">
  <g fill="#123d20">${[[-30, 420, 230], [120, 380, 280], [1080, 360, 300], [1230, 430, 220]].map(([x, y, w]) => `<polygon points="${x + w / 2},${y - w * 1.25} ${x},${y + 40} ${x + w},${y + 40}"/>`).join('')}</g>
  <g fill="#1b5230">${[[40, 470, 200], [1150, 480, 190]].map(([x, y, w]) => `<polygon points="${x + w / 2},${y - w * 1.2} ${x},${y + 40} ${x + w},${y + 40}"/>`).join('')}</g>
  <path d="M0 470 C 220 400 420 520 660 470 S 1100 410 1320 480 L1320 640 L0 640 Z" fill="#d9e8dd"/>
  <path d="M0 540 C 260 480 520 590 760 540 S 1160 500 1320 560 L1320 640 L0 640 Z" fill="#f4f8f4"/>
</svg>
<div class="head"${lang === 'ko' ? ' style="word-break:keep-all"' : ''}><h1 id="t">${title}</h1><p class="sub">${sub}</p></div>
<div class="phone" id="ph"><div class="screen">
  <div class="status"><span>9:41</span><svg width="150" height="36" viewBox="0 0 150 36"><g fill="#fff"><rect x="0" y="22" width="8" height="12" rx="2"/><rect x="12" y="16" width="8" height="18" rx="2"/><rect x="24" y="10" width="8" height="24" rx="2"/><rect x="36" y="4" width="8" height="30" rx="2"/><path d="M76 30 a4 4 0 1 0 0.1 0z"/><path d="M62 18 q14-12 28 0 l-5 5 q-9-7-18 0z"/><path d="M54 10 q22-18 44 0 l-5 5 q-17-12-34 0z"/><rect x="104" y="8" width="38" height="22" rx="6" fill="none" stroke="#fff" stroke-width="2.5"/><rect x="108" y="12" width="30" height="14" rx="3"/><rect x="144" y="15" width="4" height="8" rx="2"/></g></svg></div>
  <div class="island"></div>
  <img class="app" src="${url(`store/screenshots/raw/${lang}/${shot.n}.png`)}">
  ${shot.tab === null ? '' : `<div class="tabbar">${tabs.map((t, i) => `<div class="tab${i === shot.tab ? ' on' : ''}"><i>${glyph(TAB_ICONS[i][i === shot.tab ? 1 : 0])}</i><span>${t}</span></div>`).join('')}</div>`}
</div></div>
${shot.widget ? `<div class="widget"><img src="${url('assets/3d/christmas_tree.png')}"><b>14</b><div class="l">${s.countdown.days}</div><div class="u">${s.countdown.until}</div></div>` : ''}
<div class="char" style="${side}:-40px;background-image:url(${url(`assets/3d/${CHAR[charName]}`)})"></div>
<script>
  // Keep the caption to two lines, then place the phone under it.
  const t=document.getElementById('t');let f=112;while(t.scrollHeight>t.clientHeight&&false){}
  const lh=()=>parseFloat(getComputedStyle(t).lineHeight);
  while(t.getBoundingClientRect().height>lh()*2.05&&f>64){f-=4;t.style.fontSize=f+'px';}
  const head=document.querySelector('.head').getBoundingClientRect();
  document.getElementById('ph').style.top=Math.max(600,head.bottom+70)+'px';
</script>
</body></html>`;
}

const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1320, height: 2868 }, deviceScaleFactor: 1 });
for (const lang of LANGS) {
  const s = loadStrings(lang);
  const out = join(here, lang);
  mkdirSync(out, { recursive: true });
  for (const shot of SHOTS) {
    const file = join(here, '_page.html');
    (await import('node:fs')).writeFileSync(file, html(lang, shot, s));
    await page.goto(pathToFileURL(file).href);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(out, `${shot.file}.jpg`), type: 'jpeg', quality: 90 });
  }
  console.log('composed', lang);
}
await browser.close();
