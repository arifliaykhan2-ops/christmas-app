import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Backdrop, ModalHeader, haptic } from '@/components/ui';
import {
  LANGS,
  LANG_NAMES,
  currencyOverride,
  detectLang,
  intlLocale,
  langOverride,
  regionCurrency,
  setAppCurrency,
  setAppLang,
  strings,
  type Lang, useI18nVersion } from '@/i18n';
import { colors, fonts, radius, weights } from '@/lib/theme';

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'RUB', 'UAH', 'PLN', 'CZK', 'HUF', 'RON', 'SEK', 'NOK', 'DKK', 'CHF', 'AZN', 'TRY', 'KZT',
  'GEL', 'JPY', 'KRW', 'TWD', 'HKD', 'INR', 'IDR', 'MYR', 'VND', 'BRL', 'MXN', 'CAD', 'AUD', 'AED', 'SAR',
];

/** "EUR" → "Euro" in the current language, when the device supports it. */
function currencyName(code: string): string {
  try {
    const DN = (Intl as any).DisplayNames;
    return DN ? new DN([intlLocale], { type: 'currency' }).of(code) ?? '' : '';
  } catch {
    return '';
  }
}

type Row = { key: string; title: string; subtitle?: string; selected: boolean; onPress: () => void };

/** Full-height list for picking the app language or currency (opened from Settings). */
export default function PickerScreen() {
  useI18nVersion();
  const { kind } = useLocalSearchParams<{ kind: 'lang' | 'currency' }>();
  const s = strings.settings;

  const rows: Row[] =
    kind === 'currency'
      ? [
          { key: 'auto', title: s.auto, subtitle: regionCurrency, selected: !currencyOverride, onPress: () => setAppCurrency(null) },
          ...CURRENCIES.map((c) => ({ key: c, title: c, subtitle: currencyName(c), selected: currencyOverride === c, onPress: () => setAppCurrency(c) })),
        ]
      : [
          { key: 'auto', title: s.auto, subtitle: LANG_NAMES[detectLang()], selected: !langOverride, onPress: () => choose(null) },
          ...LANGS.map((l) => ({ key: l, title: LANG_NAMES[l], selected: langOverride === l, onPress: () => choose(l) })),
        ];

  function choose(next: Lang | null) {
    const restartNeeded = setAppLang(next);
    if (restartNeeded) Alert.alert('↻', strings.settings.restart);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Backdrop />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        contentContainerStyle={st.list}
        ListHeaderComponent={
          <View style={st.title}>
            <ModalHeader title={kind === 'currency' ? s.currency : s.languageTitle} doneLabel={strings.common.done} onDone={() => router.back()} />
          </View>
        }
        ItemSeparatorComponent={() => <View style={st.sep} />}
        renderItem={({ item, index }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: item.selected }}
            onPress={() => {
              haptic.tap();
              item.onPress();
              if (kind === 'currency') router.back();
            }}
            style={({ pressed }) => [
              st.row,
              index === 0 && st.first,
              index === rows.length - 1 && st.last,
              pressed && { backgroundColor: 'rgba(255,255,255,0.12)' },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={st.rowTitle}>{item.title}</Text>
              {!!item.subtitle && <Text style={st.rowSub}>{item.subtitle}</Text>}
            </View>
            {item.selected && <Ionicons name="checkmark" size={22} color={colors.yellow} />}
          </Pressable>
        )}
      />
    </View>
  );
}

const st = StyleSheet.create({
  list: { padding: 20, paddingBottom: 60 },
  title: { marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: colors.tile,
  },
  first: { borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md },
  last: { borderBottomLeftRadius: radius.md, borderBottomRightRadius: radius.md },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginStart: 18 },
  rowTitle: { color: colors.white, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 17 },
  rowSub: { color: colors.muted, fontFamily: fonts.body, fontWeight: weights.body, fontSize: 13, marginTop: 2 },
});
