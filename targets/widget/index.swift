import SwiftUI
import UIKit
import WidgetKit

// Shared with the app through the App Group (written by ExtensionStorage in src/lib/settings.tsx).
private let appGroup = "group.app.christmascountdown.ios"

// MARK: - Localised words (same languages as the app)

struct Words {
  let days: String
  let until: String
  let merry: String
  let tomorrow: String
  var addPhoto = "Add your photo"
}

private let words: [String: Words] = [
  "en": Words(days: "Days", until: "until Christmas", merry: "Merry Christmas!", tomorrow: "Tomorrow!", addPhoto: "Add your photo"),
  "fr": Words(days: "Jours", until: "avant Noël", merry: "Joyeux Noël !", tomorrow: "Demain !", addPhoto: "Ajoute ta photo"),
  "de": Words(days: "Tage", until: "bis Weihnachten", merry: "Frohe Weihnachten!", tomorrow: "Morgen!", addPhoto: "Dein Foto hier"),
  "it": Words(days: "Giorni", until: "a Natale", merry: "Buon Natale!", tomorrow: "Domani!", addPhoto: "Aggiungi foto"),
  "es": Words(days: "Días", until: "para Navidad", merry: "¡Feliz Navidad!", tomorrow: "¡Mañana!", addPhoto: "Añade tu foto"),
  "pt": Words(days: "Dias", until: "para o Natal", merry: "Feliz Natal!", tomorrow: "Amanhã!", addPhoto: "Adicione sua foto"),
  "nl": Words(days: "Dagen", until: "tot Kerstmis", merry: "Vrolijk kerstfeest!", tomorrow: "Morgen!", addPhoto: "Jouw foto hier"),
  "da": Words(days: "Dage", until: "til jul", merry: "Glædelig jul!", tomorrow: "I morgen!", addPhoto: "Tilføj dit foto"),
  "sv": Words(days: "Dagar", until: "kvar till jul", merry: "God jul!", tomorrow: "I morgon!", addPhoto: "Lägg till foto"),
  "nb": Words(days: "Dager", until: "til jul", merry: "God jul!", tomorrow: "I morgen!", addPhoto: "Legg til bilde"),
  "fi": Words(days: "Päivää", until: "jouluun", merry: "Hyvää joulua!", tomorrow: "Huomenna!", addPhoto: "Lisää oma kuva"),
  "pl": Words(days: "Dni", until: "do Świąt", merry: "Wesołych Świąt!", tomorrow: "Jutro!", addPhoto: "Dodaj zdjęcie"),
  "cs": Words(days: "Dní", until: "do Vánoc", merry: "Veselé Vánoce!", tomorrow: "Zítra!", addPhoto: "Přidej fotku"),
  "sk": Words(days: "Dní", until: "do Vianoc", merry: "Veselé Vianoce!", tomorrow: "Zajtra!", addPhoto: "Pridaj fotku"),
  "hu": Words(days: "Nap", until: "karácsonyig", merry: "Boldog karácsonyt!", tomorrow: "Holnap!", addPhoto: "Saját fotó"),
  "ro": Words(days: "Zile", until: "până la Crăciun", merry: "Crăciun fericit!", tomorrow: "Mâine!", addPhoto: "Adaugă poza ta"),
  "hr": Words(days: "Dana", until: "do Božića", merry: "Sretan Božić!", tomorrow: "Sutra!", addPhoto: "Dodaj fotku"),
  "el": Words(days: "Ημέρες", until: "ως τα Χριστούγεννα", merry: "Καλά Χριστούγεννα!", tomorrow: "Αύριο!", addPhoto: "Βάλε φωτογραφία"),
  "ru": Words(days: "Дней", until: "до Рождества", merry: "С Рождеством!", tomorrow: "Завтра!", addPhoto: "Добавь своё фото"),
  "uk": Words(days: "Днів", until: "до Різдва", merry: "З Різдвом!", tomorrow: "Завтра!", addPhoto: "Додай своє фото"),
  "ca": Words(days: "Dies", until: "per Nadal", merry: "Bon Nadal!", tomorrow: "Demà!", addPhoto: "Afegeix foto"),
  "ko": Words(days: "일", until: "크리스마스까지", merry: "메리 크리스마스!", tomorrow: "내일!", addPhoto: "내 사진 넣기"),
  "id": Words(days: "Hari", until: "menuju Natal", merry: "Selamat Natal!", tomorrow: "Besok!", addPhoto: "Tambah fotomu"),
  "ms": Words(days: "Hari", until: "lagi ke Krismas", merry: "Selamat Hari Krismas!", tomorrow: "Esok!", addPhoto: "Tambah foto"),
  "vi": Words(days: "Ngày", until: "đến Giáng sinh", merry: "Giáng sinh vui vẻ!", tomorrow: "Ngày mai!", addPhoto: "Thêm ảnh của bạn"),
  "hi": Words(days: "दिन", until: "क्रिसमस तक", merry: "मेरी क्रिसमस!", tomorrow: "कल!", addPhoto: "अपनी फ़ोटो जोड़ें"),
  "ja": Words(days: "日", until: "クリスマスまで", merry: "メリークリスマス！", tomorrow: "明日！", addPhoto: "写真を追加"),
  "zh-Hant": Words(days: "天", until: "距離聖誕節", merry: "聖誕快樂！", tomorrow: "明天！", addPhoto: "加入你的照片"),
  "ar": Words(days: "يوم", until: "حتى عيد الميلاد", merry: "ميلاد مجيد!", tomorrow: "غدًا!", addPhoto: "أضف صورتك"),
]

private func deviceLang() -> String {
  for id in Locale.preferredLanguages {
    if id.hasPrefix("zh") { if id.contains("Hant") || id.hasSuffix("TW") || id.hasSuffix("HK") || id.hasSuffix("MO") { return "zh-Hant" } else { continue } }
    let code = String(id.prefix { $0 != "-" && $0 != "_" })
    if code == "no" || code == "nn" { return "nb" }
    if words[code] != nil { return code }
  }
  return "en"
}

// MARK: - Timeline

struct ChristmasEntry: TimelineEntry {
  let date: Date
  let days: Int
  let isToday: Bool
  let words: Words
  // Premium personalisation written by the app (theme colours, small JPEG photo).
  let top: Color
  let bottom: Color
  let photo: UIImage?
  // Free users see an "Add your photo" hint; tapping the widget opens the paywall.
  let premium: Bool
}

private func color(hex: String?, fallback: Color) -> Color {
  guard var h = hex?.trimmingCharacters(in: .whitespaces), h.hasPrefix("#"), h.count == 7 else { return fallback }
  h.removeFirst()
  guard let v = UInt64(h, radix: 16) else { return fallback }
  return Color(red: Double((v >> 16) & 0xFF) / 255, green: Double((v >> 8) & 0xFF) / 255, blue: Double(v & 0xFF) / 255)
}

private func makeEntry(at date: Date) -> ChristmasEntry {
  let defaults = UserDefaults(suiteName: appGroup)
  let lang = defaults?.string(forKey: "lang") ?? deviceLang()
  let mode = defaults?.string(forKey: "mode") ?? (lang == "ru" ? "jan7" : "dec25")
  let w = words[lang] ?? words["en"]!
  let top = color(hex: defaults?.string(forKey: "themeTop"), fallback: Color("festiveTop"))
  let bottom = color(hex: defaults?.string(forKey: "themeBottom"), fallback: Color("festiveBottom"))
  var photo: UIImage? = nil
  if let b64 = defaults?.string(forKey: "photo"), !b64.isEmpty, let data = Data(base64Encoded: b64) { photo = UIImage(data: data) }
  let premium = defaults?.integer(forKey: "premium") == 1

  let cal = Calendar.current
  let (month, day) = mode == "jan7" ? (1, 7) : (12, 25)
  let year = cal.component(.year, from: date)
  let today = cal.startOfDay(for: date)
  var target = cal.date(from: DateComponents(year: year, month: month, day: day))!
  if today == target { return ChristmasEntry(date: date, days: 0, isToday: true, words: w, top: top, bottom: bottom, photo: photo, premium: premium) }
  if today > target { target = cal.date(from: DateComponents(year: year + 1, month: month, day: day))! }
  // Same number as the app's live countdown (full days left).
  let calendarDays = cal.dateComponents([.day], from: today, to: target).day ?? 0
  return ChristmasEntry(date: date, days: max(0, calendarDays - 1), isToday: false, words: w, top: top, bottom: bottom, photo: photo, premium: premium)
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> ChristmasEntry { makeEntry(at: Date()) }

  func getSnapshot(in context: Context, completion: @escaping (ChristmasEntry) -> Void) {
    completion(makeEntry(at: Date()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<ChristmasEntry>) -> Void) {
    let cal = Calendar.current
    let start = cal.startOfDay(for: Date())
    var entries = [makeEntry(at: Date())]
    for offset in 1...7 {
      if let next = cal.date(byAdding: .day, value: offset, to: start) { entries.append(makeEntry(at: next)) }
    }
    completion(Timeline(entries: entries, policy: .atEnd))
  }
}

// MARK: - Views

private struct Headline: View {
  let entry: ChristmasEntry
  var size: CGFloat

  var body: some View {
    if entry.isToday {
      Text(entry.words.merry)
        .font(.system(size: size * 0.42, weight: .heavy, design: .serif))
        .multilineTextAlignment(.center)
        .minimumScaleFactor(0.5)
    } else if entry.days == 0 {
      Text(entry.words.tomorrow)
        .font(.system(size: size * 0.5, weight: .heavy, design: .serif))
        .minimumScaleFactor(0.5)
    } else {
      Text("\(entry.days)")
        .font(.system(size: size, weight: .heavy, design: .serif))
        .monospacedDigit()
        .minimumScaleFactor(0.5)
    }
  }
}

private struct PhotoHint: View {
  let text: String
  let size: CGFloat

  var body: some View {
    Text("✨ (text)")
      .font(.system(size: size, weight: .bold))
      .foregroundStyle(Color("gold"))
      .lineLimit(1)
      .minimumScaleFactor(0.6)
      .padding(.top, 2)
  }
}

struct ChristmasWidgetView: View {
  @Environment(\.widgetFamily) var family
  let entry: ChristmasEntry

  var body: some View {
    switch family {
    case .accessoryInline:
      Text(entry.isToday ? "🎄 \(entry.words.merry)" : "🎄 \(entry.days) \(entry.words.days.lowercased())")
    case .accessoryCircular:
      ZStack {
        AccessoryWidgetBackground()
        VStack(spacing: -2) {
          Text(entry.isToday ? "🎄" : "\(entry.days)").font(.system(size: 22, weight: .bold, design: .serif))
          Text(entry.words.days).font(.system(size: 9, weight: .semibold)).lineLimit(1).minimumScaleFactor(0.6)
        }
      }
    case .accessoryRectangular:
      VStack(alignment: .leading, spacing: 0) {
        Text(entry.isToday ? entry.words.merry : "🎄 \(entry.days) \(entry.words.days.lowercased())")
          .font(.system(size: 17, weight: .bold, design: .serif))
        if !entry.isToday { Text(entry.words.until).font(.system(size: 13)).lineLimit(1) }
      }
    case .systemMedium:
      HStack(spacing: 14) {
        if entry.photo == nil {
          Image(entry.isToday ? "santa" : "tree").resizable().scaledToFit().frame(width: 104, height: 104)
        }
        VStack(alignment: .leading, spacing: 2) {
          Headline(entry: entry, size: 58).foregroundStyle(Color("cream"))
          if !entry.isToday {
            Text(entry.words.days.uppercased()).font(.system(size: 12, weight: .bold)).kerning(1.5).foregroundStyle(Color("gold"))
            Text(entry.words.until).font(.system(size: 15, weight: .semibold, design: .serif).italic()).foregroundStyle(Color("cream"))
          }
          if !entry.premium { PhotoHint(text: entry.words.addPhoto, size: 12) }
        }
        Spacer(minLength: 0)
      }
    default:
      VStack(spacing: 0) {
        if entry.photo == nil {
          Image(entry.isToday ? "santa" : "tree").resizable().scaledToFit().frame(width: 52, height: 52)
        } else {
          Spacer(minLength: 0)
        }
        Headline(entry: entry, size: 46).foregroundStyle(Color("cream"))
        if !entry.isToday {
          Text(entry.words.days.uppercased()).font(.system(size: 10, weight: .bold)).kerning(1.2).foregroundStyle(Color("gold"))
          if entry.premium {
            Text(entry.words.until).font(.system(size: 11, weight: .semibold, design: .serif).italic()).foregroundStyle(Color("cream")).lineLimit(1).minimumScaleFactor(0.7)
          }
        }
        if !entry.premium { PhotoHint(text: entry.words.addPhoto, size: 10) }
      }
    }
  }
}

struct ChristmasWidget: Widget {
  let kind = "ChristmasWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      ChristmasWidgetView(entry: entry)
        .widgetURL(entry.premium ? nil : URL(string: "christmascountdown://premium"))
        .containerBackground(for: .widget) {
          if let photo = entry.photo {
            ZStack {
              Image(uiImage: photo).resizable().scaledToFill()
              LinearGradient(colors: [.black.opacity(0.05), .black.opacity(0.65)], startPoint: .top, endPoint: .bottom)
            }
          } else {
            LinearGradient(colors: [entry.top, entry.bottom], startPoint: .topLeading, endPoint: .bottomTrailing)
          }
        }
    }
    .configurationDisplayName("Christmas Countdown")
    .description("🎄")
    .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular, .accessoryInline])
  }
}

@main
struct ChristmasWidgets: WidgetBundle {
  var body: some Widget {
    ChristmasWidget()
  }
}
