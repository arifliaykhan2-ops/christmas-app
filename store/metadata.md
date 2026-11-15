# Christmas Countdown – Widget — App Store təlimatı

## Ümumi (bütün dillər)

| Sahə | Dəyər |
|---|---|
| Bundle ID | `app.christmascountdown.ios` |
| Apple Team ID | `CBRUBJ4N2Z` (Deer ilə eyni hesab) |
| Expo owner | `ayxanarifs-team` |
| Əsas kateqoriya | Lifestyle |
| İkinci kateqoriya | Entertainment |
| Yaş reytinqi | 4+ (bütün suallara "None"; reklam yoxdur, istifadəçi məzmunu yoxdur) |
| Qiymət | Pulsuz |
| App Privacy | Yalnız **Purchase History** (abunə üçün, RevenueCat). Ətraflı: aşağıda "App Privacy" bölməsi |
| Privacy Policy URL | `https://arifliaykhan2-ops.github.io/christmas-app/privacy/` (GitHub Pages) |
| Copyright | 2026 (sahibin adı) |

## Dillər

Ad, alt başlıq, açar sözlər, təsvir və tanıtım mətni `asc/` qovluğundadır. Format Deer layihəsindəki ilə eynidir:

- `asc/app-info/<locale>.json` faylında **name**, **subtitle** və **privacyPolicyUrl** var.
- `asc/version/1.0.0/<locale>.json` faylında **description**, **keywords** və **promotionalText** var.

Mətnləri dəyişmək üçün `listing.json` faylını redaktə edin, sonra bu əmri işlədin:

```bash
node store/build-asc.cjs
```

Bu əmr Apple limitlərini yoxlayır (ad və alt başlıq ≤30, açar sözlər ≤100, tanıtım mətni ≤170 simvol) və 35 lokal faylını yenidən yaradır.

### ASO qaydaları (mətnlər bu qaydalarla yazılıb)

- Apple ad + alt başlıq + açar sözləri birlikdə indeksləyir. Buna görə açar sözlərdə ad və alt başlıqdakı sözlər **təkrarlanmır**: yer boşa getməsin.
- Alt başlıq "Widget" sözü ilə başlayır. "christmas countdown widget" ən çox axtarılan ifadələrdən biridir.
- Açar sözlərə `2026` əlavə olunub. Gələn il `listing.json`-da ili dəyişin.
- Təsvirin sonunda Premium abunə bloku var: qiymət, 7 gün pulsuz, avtomatik yenilənmə, ləğv qaydası və İstifadə Şərtləri (EULA) linki. Apple 3.1.2 qaydası bunu tələb edir.

## Ekran şəkilləri

Qovluq `store/screenshots/<dil>/` altındadır. Hər dildə 6 şəkil var:

| Fayl | Ekran |
|---|---|
| `01-countdown.jpg` | Geri sayım |
| `02-advent.jpg` | Advent qapısı və İncil ayəsi |
| `03-secret-santa.jpg` | Gizli Santa |
| `04-naughty-nice.jpg` | Naughty/Nice skaneri |
| `05-gift-list.jpg` | Hədiyyə siyahısı və büdcə |
| `06-premium.jpg` | Premium tema və widget |

- Ölçü **1320×2868** (iPhone 6.9"). App Store Connect bu ölçünü kiçik iPhone-lar üçün avtomatik kiçildir, başqa ölçü lazım deyil.
- Şəkillər Deer-dəki üsulla hazırlanıb: tətbiqin **real ekranı** telefon çərçivəsinə qoyulur, üstündə böyük başlıq, arxada fon və 3D obyekt olur.
- Hər dildə tətbiq həmin dildə açılır. Ad, valyuta və hədiyyələr də həmin ölkəyə uyğundur.

App Store Connect lokalı ilə qovluq uyğunluğu: `en` → en-US, en-GB, en-AU, en-CA; `fr` → fr-FR, fr-CA; `es` → es-ES, es-MX; `pt` → pt-BR, pt-PT; `nb` → no; `nl` → nl-NL; `de` → de-DE; `ar` → ar-SA. Qalanları eyni addadır.

Şəkilləri yenidən yaratmaq üçün:

1. Expo veb serveri `:8081` portunda işləməlidir:

```bash
npx expo start --web
```

2. `store/screenshots` qovluğunda tətbiqin ekranlarını çəkin (`<pw>` = playwright-core quraşdırılmış qovluq; yalnız bir neçə dil üçün sona `en,de` əlavə edin):

```bash
node capture.mjs <pw>
```

3. Çəkilən ekranları kompozisiyaya çevirin:

```bash
node compose.mjs <pw>
```

Başlıqlar və nümunə adlar `data.json` faylındadır.

## Build və göndərmə (Mac lazım deyil)

1. Expo-ya daxil olun:

```bash
npx eas-cli@latest login
```

2. EAS layihəsini bağlayın (yalnız birinci dəfə):

```bash
npx eas-cli@latest init
```

3. Production build yığın. App Group və Widget üçün profillər avtomatik yaradılır:

```bash
npx eas-cli@latest build --platform ios --profile production
```

4. Build-i App Store-a göndərin:

```bash
npx eas-cli@latest submit --platform ios --latest
```

Göndərməzdən əvvəl App Store Connect-də yeni tətbiq yaradın (Bundle ID: `app.christmascountdown.ios`). Sonra `ascAppId`-ni `eas.json` → `submit.production.ios` bölməsinə əlavə edin.

## Vaxt planı

- Apple yoxlaması adətən 1-2 gün çəkir.
- Dekabr axtarış trendini tutmak üçün **ən gec 1 dekabra qədər göndərin**.
- 23-27 dekabr arası Apple-ın bayram fasiləsində yoxlama yavaşlayır.

## Hüquqlar (Credits)

- 3D elementlər: Microsoft Fluent Emoji, MIT License (`assets/3d/LICENSE-fluentui-emoji.txt`).
- Qar animasiyası: LottieFiles, Lottie Simple License (`assets/lottie/CREDITS.txt`).

Bu qeydlər tətbiqin Ayarlar ekranında da göstərilir.

### İncil ayələri (Advent qapıları)

Mətnlər getbible.net və eBible.org saytlarından götürülüb. Hər dil üçün mənbə `src/i18n/verses.ts` faylında `credit` sahəsindədir və tətbiqin Ayarlar ekranında göstərilir.

| Lisenziya | Dillər |
|---|---|
| Public Domain | ingilis, fransız, alman, italyan, holland, danimarka, isveç, norveç, fin, polyak, çex, macar, xorvat, yunan, rus, ukrayna, koreya, vyetnam, yapon, Çin, rumın |
| CC BY-SA 4.0 | hind, indoneziya, slovak (mənbə göstərilməklə kommersiya istifadəsinə icazə var) |
| CC BY-ND 4.0 | malay (dəyişdirilmədən istifadə olunur) |
| CC BY 3.0 BR | portuqal (Bíblia Livre) |
| Reina-Valera 1909 | ispan (paylanmasına icazə verilib) |
| Smith & Van Dyke | ərəb (paylanmasına icazə verilib) |

Katalan dilində pulsuz tərcümə tapılmadı, ona görə yalnız ayə istinadı göstərilir. Slovak, malay və rumın tərcümələrində Yeşaya kitabı yoxdur, o 3 gündə də yalnız istinad görünür.

## Christmas Premium (aylıq abunə, $0.99, ilk 7 gün pulsuz)

**Premium-a daxil olanlar:**
- Countdown ekranında və vidcetdə öz şəklin.
- 6 dizayn mövzusu.
- Paylaşılan şəkillərdə tətbiq adının olmaması.

Abunə bitəndə tətbiq avtomatik pulsuz görünüşə qayıdır.

Ödəniş Apple In-App Purchase ilə alınır, RevenueCat isə yoxlayır. Bu, Deer-dəki quruluşla eynidir. Expo Go-da ödəniş **test rejimindədir**: pul tutulmur, düymə dərhal Premium-u açır.

### 1. App Store Connect
1. **My Apps → +** ilə tətbiqi yaradın (Bundle ID: `app.christmascountdown.ios`).
2. **Monetization → Subscriptions** bölməsində yeni qrup yaradın: `Christmas Premium`.
3. Qrupa bir məhsul əlavə edin:
   - Product ID: **`app.christmascountdown.ios.premium.monthly`** (kodla eyni olmalıdır)
   - Müddət: **1 Month**, qiymət: **$0.99**
4. Həmin məhsulda **Introductory Offer** yaradın:
   - **Free**, **1 week**
   - Bütün ölkələr üçün
5. Ad və təsvir yazın, Apple yoxlaması üçün ödəniş ekranının şəklini əlavə edin.
6. "Paid Apps" müqaviləsi Deer üçün artıq imzalanıb, yenidən imzalamaq lazım deyil.

### 2. RevenueCat
1. Deer layihəsinin yanında yeni App yaradın: **Apps → + New → App Store**, Bundle ID `app.christmascountdown.ios`. Eyni In-App Purchase açarını (.p8) yükləyin.
2. **Products → Import** ilə yuxarıdakı məhsulu gətirin.
3. **Entitlements → + New**: identifier **`premium`** (kodla eyni olmalıdır). Məhsulu ona bağlayın.
4. **Offerings**: `default` offering-i Current edin, `$rc_monthly` package-ni əlavə edin.
5. Bu tətbiqin `appl_` ilə başlayan public açarını `eas.json` → `build.base.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY` sahəsinə yazın.

### 3. Məxfilik siyasəti (abunə üçün məcburidir)
Siyasət tətbiqin içindədir: **Ayarlar → Məxfilik siyasəti** və ödəniş ekranındakı "Privacy" linki. 29 dildədir, mətn `src/i18n/privacy.ts` faylındadır.

App Store Connect-də link sahəsi məcburidir. Eyni mətnin veb versiyası `docs/privacy/index.html` faylındadır və GitHub Pages ilə açılır:
`https://arifliaykhan2-ops.github.io/christmas-app/privacy/`

GitHub-da bir dəfə Pages-i açın: **Settings → Pages → Branch: `main`, qovluq: `/docs` → Save**.

Mətni dəyişsəniz, əvvəl `src/i18n/privacy.ts` faylını redaktə edin, sonra veb versiyanı yeniləyin:

```bash
node store/privacy/build.cjs
```

İstifadə şərtləri üçün Apple-ın standart EULA linki artıq ekrandadır.

### 4. App Privacy ("nutrition label")
- **Purchases → Purchase History** (RevenueCat): App Functionality, istifadəçiyə bağlı deyil, izləmə üçün deyil.
- Başqa heç bir məlumat toplanmır. Şəkil yalnız telefonda saxlanılır.
