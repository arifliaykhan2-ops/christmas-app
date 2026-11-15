// One-off ASO pass over listing.json:
//  - subtitles lead with "Widget" (high-volume "christmas countdown widget" searches)
//  - keywords never repeat words already in the name/subtitle; "2026" added
//  - outro no longer claims "no data collection" (RevenueCat keeps purchase history)
//  - description gets the Premium subscription paragraph + Terms of Use link (Apple 3.1.2)
const fs = require('fs');
const path = require('path');
const ts = require(path.join(__dirname, '..', 'node_modules', 'typescript'));
const file = path.join(__dirname, 'listing.json');
const L = JSON.parse(fs.readFileSync(file, 'utf8'));
const EULA = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

const SUB = {
  en: 'Advent Calendar & Secret Santa', fr: 'Widget et Père Noël secret', de: 'Widget, Wichteln & Geschenke', it: 'Widget, regali e Babbo segreto',
  es: 'Widget y amigo invisible', pt: 'Widget e amigo secreto', nl: 'Widget, lootjes en cadeaus', da: 'Widget, nisse og gaveliste',
  sv: 'Widget, julklappslek & listor', nb: 'Widget, nisse og gaveliste', fi: 'Widget, lahjat ja arvonta', pl: 'Widżet, Mikołajki i prezenty',
  cs: 'Widget, Ježíšek a dárky', sk: 'Widget, Ježiško a darčeky', hu: 'Widget, angyalka és ajándék', ro: 'Widget, Moș secret și cadouri',
  hr: 'Widget, tajni Djed i darovi', el: 'Widget, Μυστικός Άγιος Βασίλης', ru: 'Виджет, Тайный Санта, подарки', uk: 'Віджет і Таємний Санта',
  ca: 'Giny, amic invisible i regals', ko: '위젯, 시크릿 산타, 선물 목록', id: 'Widget, Secret Santa & hadiah', ms: 'Widget, Secret Santa & hadiah',
  vi: 'Tiện ích, Ông già bí mật, quà', hi: 'विजेट, सीक्रेट सांता और उपहार', ja: 'ウィジェット・シークレットサンタ・プレゼント', 'zh-Hant': '小工具、交換禮物、禮物清單', ar: 'أداة، سانتا السري والهدايا',
};

// First line of the outro, now without the data-collection claim.
const OFFLINE = {
  en: 'Works fully offline. No account, no ads.', fr: 'Fonctionne entièrement hors ligne. Sans compte, sans publicité.', de: 'Funktioniert komplett offline. Kein Konto, keine Werbung.',
  it: 'Funziona completamente offline. Nessun account, nessuna pubblicità.', es: 'Funciona totalmente sin conexión. Sin cuenta y sin anuncios.', pt: 'Funciona totalmente offline. Sem conta, sem anúncios.',
  nl: 'Werkt volledig offline. Geen account, geen advertenties.', da: 'Virker helt offline. Ingen konto, ingen reklamer.', sv: 'Fungerar helt offline. Inget konto, ingen reklam.',
  nb: 'Fungerer helt uten nett. Ingen konto, ingen reklame.', fi: 'Toimii täysin ilman verkkoyhteyttä. Ei tiliä, ei mainoksia.', pl: 'Działa całkowicie offline. Bez konta, bez reklam.',
  cs: 'Funguje zcela offline. Bez účtu, bez reklam.', sk: 'Funguje úplne offline. Bez účtu, bez reklám.', hu: 'Teljesen offline működik. Nincs fiók, nincs reklám.',
  ro: 'Funcționează complet offline. Fără cont, fără reclame.', hr: 'Radi potpuno bez interneta. Bez računa, bez oglasa.', el: 'Λειτουργεί εντελώς εκτός σύνδεσης. Χωρίς λογαριασμό, χωρίς διαφημίσεις.',
  ru: 'Работает полностью офлайн. Без аккаунта и рекламы.', uk: 'Працює повністю офлайн. Без акаунта й реклами.', ca: 'Funciona del tot sense connexió. Sense compte ni anuncis.',
  ko: '완전히 오프라인으로 작동해요. 계정도 광고도 없어요.', id: 'Berfungsi sepenuhnya tanpa internet. Tanpa akun, tanpa iklan.', ms: 'Berfungsi sepenuhnya tanpa internet. Tiada akaun, tiada iklan.',
  vi: 'Hoạt động hoàn toàn ngoại tuyến. Không cần tài khoản, không quảng cáo.', hi: 'पूरी तरह ऑफ़लाइन चलता है। कोई अकाउंट नहीं, कोई विज्ञापन नहीं।', ja: '完全にオフラインで動作。アカウント不要、広告なし。',
  'zh-Hant': '完全離線運作。無需帳號、沒有廣告。', ar: 'يعمل بالكامل دون اتصال. بلا حساب ولا إعلانات.',
};

const TRIAL = {
  en: 'Free for 7 days, then an auto-renewing monthly subscription.', fr: 'Gratuit pendant 7 jours, puis abonnement mensuel renouvelé automatiquement.',
  de: '7 Tage gratis, danach ein sich automatisch verlängerndes Monatsabo.', it: 'Gratis per 7 giorni, poi abbonamento mensile a rinnovo automatico.',
  es: 'Gratis durante 7 días y después suscripción mensual con renovación automática.', pt: 'Grátis por 7 dias, depois assinatura mensal com renovação automática.',
  nl: '7 dagen gratis, daarna een maandabonnement dat automatisch wordt verlengd.', da: 'Gratis i 7 dage, derefter et månedligt abonnement med automatisk fornyelse.',
  sv: 'Gratis i 7 dagar, sedan en månadsprenumeration som förnyas automatiskt.', nb: 'Gratis i 7 dager, deretter et månedlig abonnement som fornyes automatisk.',
  fi: '7 päivää ilmaiseksi, sitten automaattisesti uusiutuva kuukausitilaus.', pl: 'Przez 7 dni za darmo, potem automatycznie odnawiana subskrypcja miesięczna.',
  cs: '7 dní zdarma, poté automaticky obnovované měsíční předplatné.', sk: '7 dní zadarmo, potom automaticky obnovované mesačné predplatné.',
  hu: '7 napig ingyenes, utána automatikusan megújuló havi előfizetés.', ro: 'Gratuit 7 zile, apoi abonament lunar cu reînnoire automată.',
  hr: '7 dana besplatno, zatim mjesečna pretplata koja se automatski obnavlja.', el: 'Δωρεάν για 7 ημέρες, μετά μηνιαία συνδρομή με αυτόματη ανανέωση.',
  ru: '7 дней бесплатно, затем ежемесячная подписка с автопродлением.', uk: '7 днів безкоштовно, потім щомісячна підписка з автопоновленням.',
  ca: 'Gratis durant 7 dies i després subscripció mensual amb renovació automàtica.', ko: '7일 무료 체험 후 매월 자동 갱신되는 구독입니다.',
  id: 'Gratis 7 hari, lalu langganan bulanan yang diperpanjang otomatis.', ms: 'Percuma 7 hari, kemudian langganan bulanan yang diperbaharui secara automatik.',
  vi: 'Miễn phí 7 ngày, sau đó là gói đăng ký hằng tháng tự động gia hạn.', hi: '7 दिन मुफ़्त, फिर अपने आप नवीनीकृत होने वाली मासिक सदस्यता।',
  ja: '7日間無料、その後は毎月自動更新されるサブスクリプションです。', 'zh-Hant': '免費 7 天，之後為每月自動續訂的訂閱。', ar: 'مجانًا لمدة 7 أيام، ثم اشتراك شهري يتجدد تلقائيًا.',
};

function appStrings(lang) {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src/i18n/locales', `${lang}.ts`), 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const m = { exports: {} };
  new Function('module', 'exports', 'require', js)(m, m.exports, () => ({}));
  return m.exports.default;
}

const words = (s) => s.toLocaleLowerCase().split(/[\s,.:;!&/·・、，،-]+/u).filter(Boolean);

for (const [lang, d] of Object.entries(L)) {
  const s = appStrings(lang);
  d.subtitle = SUB[lang];
  const taken = new Set([...words(d.name), ...words(d.subtitle)]);
  const kws = ['2026', ...d.keywords.split(',').map((k) => k.trim()).filter(Boolean)]
    .filter((k) => !words(k).every((w) => taken.has(w)))
    .filter((k, i, a) => a.indexOf(k) === i);
  let out = '';
  for (const k of kws) if ((out ? out.length + 1 : 0) + k.length <= 100) out = out ? `${out},${k}` : k;
  d.keywords = out;
  const merry = d.outro.split('\n\n').pop();
  const p = s.premium;
  d.outro = [
    OFFLINE[lang],
    `⭐ ${p.title}\n• ${p.photo}\n• ${p.themes}\n• ${p.watermark}\n${TRIAL[lang]}`,
    p.legal,
    `${p.terms}: ${EULA}`,
    merry,
  ].join('\n\n');
}
fs.writeFileSync(file, JSON.stringify(L, null, 2) + '\n');
console.log('updated', Object.keys(L).length, 'languages');
console.log(L.en.subtitle, '|', L.en.keywords);
console.log(L.en.outro);
