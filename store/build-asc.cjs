// Validates App Store limits and writes per-locale JSON (same layout as the Deer project).
const fs = require('fs');
const path = require('path');
const L = require('./listing.json');
const ASC = {
  en: ['en-US', 'en-GB', 'en-AU', 'en-CA'], fr: ['fr-FR', 'fr-CA'], de: ['de-DE'], it: ['it'], es: ['es-ES', 'es-MX'],
  pt: ['pt-BR', 'pt-PT'], nl: ['nl-NL'], da: ['da'], sv: ['sv'], nb: ['no'], fi: ['fi'], pl: ['pl'], cs: ['cs'], sk: ['sk'],
  hu: ['hu'], ro: ['ro'], hr: ['hr'], el: ['el'], ru: ['ru'], uk: ['uk'], ca: ['ca'], ko: ['ko'], id: ['id'], ms: ['ms'],
  vi: ['vi'], hi: ['hi'], ja: ['ja'], 'zh-Hant': ['zh-Hant'], ar: ['ar-SA'],
};
const LIMIT = { name: 30, subtitle: 30, keywords: 100, promo: 170 };
let errors = 0;
const out = path.join(__dirname, 'asc');
for (const dir of ['app-info', 'version/1.0.0']) fs.mkdirSync(path.join(out, dir), { recursive: true });
for (const [lang, d] of Object.entries(L)) {
  for (const [k, max] of Object.entries(LIMIT)) {
    const len = [...d[k]].length;
    if (len > max) { errors++; console.log(`✗ ${lang}.${k} ${len}/${max}: ${d[k]}`); }
  }
  const description = [d.intro, '', ...d.f.map((x) => `• ${x}`), '', d.outro].join('\n');
  for (const loc of ASC[lang]) {
    fs.writeFileSync(path.join(out, 'app-info', `${loc}.json`), JSON.stringify({ name: d.name, subtitle: d.subtitle, privacyPolicyUrl: 'https://arifliaykhan2-ops.github.io/christmas-app/privacy/' }, null, 2) + '\n');
    fs.writeFileSync(path.join(out, 'version/1.0.0', `${loc}.json`), JSON.stringify({ description, keywords: d.keywords, promotionalText: d.promo }, null, 2) + '\n');
  }
}
console.log(errors ? `${errors} problem(s)` : `ok — ${Object.values(ASC).flat().length} App Store locales`);
process.exit(errors ? 1 : 0);
