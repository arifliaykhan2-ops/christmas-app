// Captures the real app (Expo web, iPhone 6.9" size) for every language and shot.
// Usage: node capture.mjs <playwright-core dir> [lang,lang…]   (Expo web must run on :8081)
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(process.argv[2], 'package.json'));
const { chromium } = require('playwright-core');
const data = JSON.parse(readFileSync(join(here, 'data.json'), 'utf8'));
const only = process.argv[3]?.split(',');
const LANGS = Object.keys(data).filter((k) => k !== '_' && (!only || only.includes(k)));

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const VIEW = { width: 430, height: 873 }; // screen below the status bar; ×3 = 1290 px wide

const nice = (v) => {
  const p = 10 ** Math.max(0, Math.floor(Math.log10(v)) - 1);
  return Math.round(v / p) * p;
};

function seeds(lang, d, shot) {
  const r = (usd) => nice(usd * d.rate);
  const people = d.names.map((name, i) => ({ id: `p${i}`, name }));
  const gifts = [
    { id: 'g1', name: d.names[0], budget: r(100), gifts: [
      { id: 'a', title: d.gifts[0], price: r(18), status: 'wrapped' },
      { id: 'b', title: d.gifts[1], price: r(25), status: 'bought' },
      { id: 'c', title: d.gifts[2], price: r(59), status: 'idea' },
    ] },
    { id: 'g2', name: d.names[1], budget: r(60), gifts: [
      { id: 'd', title: d.gifts[3], price: r(12), status: 'bought' },
      { id: 'e', title: d.gifts[4], price: r(35), status: 'idea' },
    ] },
  ];
  const date = new Intl.DateTimeFormat(d.locale, { day: 'numeric', month: 'short' }).format(new Date(2026, 11, 20));
  const store = {
    'app.lang': lang,
    'app.currency': d.currency,
    'settings.onboarded': 'true',
    'paywall.intro': 'true',
    'settings.mode': '"dec25"',
    'settings.snow': 'false',
    'advent.opened': JSON.stringify(Array.from({ length: 17 }, (_, i) => i + 1)),
    santa: JSON.stringify({ people, rules: [], budget: String(r(20)), date, draw: { p0: 'p2', p1: 'p3', p2: 'p4', p3: 'p0', p4: 'p1' }, seen: ['p0', 'p2'] }),
    gifts: JSON.stringify(gifts),
  };
  if (shot === 6) {
    store['premium:v1'] = JSON.stringify({ active: true, expiresAt: 4102444800000, test: false });
    store['settings.theme'] = '"velvet"';
  }
  return store;
}

const SHOTS = [
  { n: 1, path: '/', date: [2026, 11, 1, 10, 12, 30] },
  { n: 2, path: '/door/18', date: [2026, 11, 18, 9, 0, 0] },
  { n: 3, path: '/santa', date: [2026, 11, 5, 18, 0, 0] },
  { n: 4, path: '/scanner?demo=nice', date: [2026, 11, 5, 18, 0, 0], scan: true },
  { n: 5, path: '/gifts', date: [2026, 11, 8, 18, 0, 0] },
  { n: 6, path: '/', date: [2026, 11, 10, 20, 31, 5] },
];

const browser = await chromium.launch({ executablePath: EDGE });
for (const lang of LANGS) {
  const d = data[lang];
  const out = join(here, 'raw', lang);
  mkdirSync(out, { recursive: true });
  for (const shot of SHOTS) {
    const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 3, locale: d.locale });
    await ctx.addInitScript(
      ({ store, date, scan }) => {
        localStorage.clear();
        for (const [k, v] of Object.entries(store)) localStorage.setItem(k, v);
        const fixed = new Date(...date).getTime();
        const Real = Date;
        class FakeDate extends Real {
          constructor(...a) {
            super(...(a.length ? a : [fixed]));
          }
          static now() {
            return fixed;
          }
        }
        // eslint-disable-next-line no-global-assign
        Date = FakeDate;
        if (scan) Math.random = () => 0.2; // deterministic "NICE" result
      },
      { store: seeds(lang, d, shot.n), date: shot.date, scan: !!shot.scan },
    );
    const page = await ctx.newPage();
    await page.goto(`http://localhost:8081${shot.path}`, { waitUntil: 'networkidle', timeout: 180000 });
    await page.addStyleTag({ content: '[class*="navigationMenuRoot"]{display:none!important} img{pointer-events:none!important;-webkit-user-drag:none}' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: join(out, `${shot.n}.png`) });
    await ctx.close();
  }
  console.log('captured', lang);
}
await browser.close();
