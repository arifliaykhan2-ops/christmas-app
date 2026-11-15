import { router } from 'expo-router';
import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Backdrop, Card, Chip, Icon, Label, ModalHeader, P, haptic } from '@/components/ui';
import { closeModal } from '@/lib/nav';
import { LANG_NAMES, currencyOverride, detectLang, lang, langOverride, regionCurrency, strings, useI18nVersion } from '@/i18n';
import { PRIVACY } from '@/i18n/privacy';
import { VERSES } from '@/i18n/verses';
import { usePremium } from '@/lib/premium';
import { useSettings } from '@/lib/settings';
import { colors, fonts, weights } from '@/lib/theme';

export default function SettingsScreen() {
  useI18nVersion();
  const s = strings.settings;
  const { mode, setMode, reminders, setReminders, snow, setSnow } = useSettings();
  const premium = usePremium().active;
  const [denied, setDenied] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Backdrop />
      <ScrollView contentContainerStyle={st.wrap}>
        <ModalHeader title={s.title} doneLabel={strings.common.done} onDone={closeModal} />

        <Card inner={{ paddingVertical: 6, gap: 0 }}>
          <LinkRow
            icon="sparkles-outline"
            title={strings.premium.title}
            value={premium ? '✓' : ''}
            onPress={() => router.push('/premium')}
          />
          <View style={st.sep} />
          <LinkRow
            icon="color-palette-outline"
            title={strings.premium.personalize}
            value=""
            onPress={() => router.push(premium ? '/customize' : '/premium')}
          />
          <View style={st.sep} />
          <LinkRow
            icon="language-outline"
            title={s.languageTitle}
            value={langOverride ? LANG_NAMES[langOverride] : `${s.auto} · ${LANG_NAMES[detectLang()]}`}
            onPress={() => router.push({ pathname: '/picker', params: { kind: 'lang' } })}
          />
          <View style={st.sep} />
          <LinkRow
            icon="cash-outline"
            title={s.currency}
            value={currencyOverride ?? `${s.auto} · ${regionCurrency}`}
            onPress={() => router.push({ pathname: '/picker', params: { kind: 'currency' } })}
          />
          <View style={st.sep} />
          <LinkRow icon="shield-checkmark-outline" title={PRIVACY[lang].title} value="" onPress={() => router.push('/privacy')} />
        </Card>

        <Card>
          <Label>{s.date}</Label>
          <View style={{ gap: 8 }}>
            <Chip label={`🎄  ${s.dec25}`} on={mode === 'dec25'} onPress={() => setMode('dec25')} />
            <Chip label={`✨  ${s.jan7}`} on={mode === 'jan7'} onPress={() => setMode('jan7')} />
          </View>
        </Card>

        <Card>
          <View style={st.row}>
            <View style={{ flex: 1, gap: 4 }}>
              <Label>{s.reminders}</Label>
              <P muted style={{ fontSize: 14 }}>{s.remindersHint}</P>
            </View>
            <Switch
              value={reminders}
              trackColor={{ true: colors.yellow }}
              thumbColor={colors.white}
              onValueChange={async (on) => setDenied(!(await setReminders(on)) && on)}
            />
          </View>
          {denied && <P style={{ color: colors.danger, fontSize: 14 }}>{s.remindersDenied}</P>}
        </Card>

        <Card>
          <View style={st.row}>
            <Label style={{ flex: 1, fontSize: 16, color: colors.white }}>❄️  {s.snow}</Label>
            <Switch value={snow} trackColor={{ true: colors.yellow }} thumbColor={colors.white} onValueChange={setSnow} />
          </View>
        </Card>

        <Pressable onPress={() => router.push('/widget')} style={({ pressed }) => pressed && { opacity: 0.7 }}>
          <Card>
            <View style={st.row}>
              <Icon name="tree" size={40} />
              <View style={{ flex: 1, gap: 2 }}>
                <Label style={{ fontSize: 16, color: colors.white }}>{strings.widget.title}</Label>
                <P muted style={{ fontSize: 14 }}>{strings.widget.cta}</P>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </View>
          </Card>
        </Pressable>

        <View style={{ gap: 4 }}>
          <Label>{s.credits}</Label>
          <P muted style={{ fontSize: 12 }}>
            3D: Microsoft Fluent Emoji (MIT License). Snow animation: LottieFiles (Lottie Simple License).
            {VERSES[lang].credit ? `
📖 ${VERSES[lang].credit} — getbible.net / eBible.org` : ''}
          </P>
        </View>

      </ScrollView>
    </View>
  );
}

function LinkRow({ icon, title, value, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; value: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => [st.link, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name={icon} size={22} color={colors.white} />
      <Text style={st.linkTitle}>{title}</Text>
      <Text style={st.linkValue} numberOfLines={1}>{value}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const st = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  linkTitle: { color: colors.white, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 17 },
  linkValue: { flex: 1, textAlign: 'right', color: colors.muted, fontFamily: fonts.body, fontWeight: weights.body, fontSize: 15 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  wrap: { padding: 20, gap: 16, paddingBottom: 48 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
