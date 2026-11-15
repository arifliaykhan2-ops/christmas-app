import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { WidgetPreview } from '@/components/WidgetPreview';
import { Button, Card, CircleButton, H1, Icon, InfoTile, P, RoundIcon, Scene, TextButton, haptic } from '@/components/ui';
import { fmt, formatDayMonth, formatMoney, formatNumber, strings, useI18nVersion } from '@/i18n';
import { countdown, doorDate, todaysDoor } from '@/lib/christmas';
import { THEMES } from '@/lib/personalize';
import { usePremium } from '@/lib/premium';
import { useSettings } from '@/lib/settings';
import { useStored } from '@/lib/storage';
import { colors, fonts, radius, weights } from '@/lib/theme';

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export default function CountdownScreen() {
  useI18nVersion();
  const s = strings.countdown;
  const { mode, theme, photo, previewPhoto, choosePhoto, clearPhoto } = useSettings();
  const premium = usePremium().active;
  // Free users' shared pictures carry the app name; Premium removes it.
  const [stamp, setStamp] = useState(false);
  const now = useNow();
  const cd = countdown(now, mode);
  const door = todaysDoor(now);
  const shareRef = useRef<ComponentRef<typeof View>>(null);
  const [santa] = useStored<{ people: unknown[] }>('santa', { people: [] });
  const [gifts] = useStored<{ budget: number; gifts: { price: number; status: string }[] }[]>('gifts', []);
  const spent = gifts.reduce((a, p) => a + p.gifts.filter((g) => g.status !== 'idea').reduce((b, g) => b + g.price, 0), 0);
  const budget = gifts.reduce((a, p) => a + p.budget, 0);
  // Free users try their own photo right away; the share image never includes a preview.
  const shown = photo ?? (stamp ? null : previewPhoto);

  // First launch after onboarding: offer Premium once (closable, Apple 3.1.2).
  const [introSeen, setIntroSeen, introLoaded] = useStored<boolean>('paywall.intro', false);
  useEffect(() => {
    if (!introLoaded || introSeen) return;
    setIntroSeen(true);
    if (!premium) router.push('/premium');
  }, [introLoaded, introSeen, premium, setIntroSeen]);

  async function addPhoto() {
    haptic.tap();
    try {
      await choosePhoto();
    } catch {}
  }

  async function share() {
    try {
      if (!premium) {
        setStamp(true);
        await new Promise((r) => setTimeout(r, 80));
      }
      const uri = await captureRef(shareRef, { format: 'png', quality: 1 });
      setStamp(false);
      await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
    } catch {
      setStamp(false);
    }
  }

  return (
    <Scene>
      <View style={st.header}>
        <RoundIcon icon="share-outline" label={strings.common.share} onPress={share} />
        <Text style={st.headerTitle}>{formatDayMonth(cd.target)}</Text>
        <RoundIcon icon="options-outline" label={strings.settings.title} filled onPress={() => router.push('/settings')} />
      </View>

      {/* Hero card — mirrors the reference's tall "Christmas is coming" card. */}
      <View ref={shareRef} collapsable={false}>
        <Card
          inner={st.heroInner}
          gradient={THEMES[theme].colors}
          background={
            shown ? (
              <>
                <Image source={{ uri: shown }} style={StyleSheet.absoluteFill} contentFit="cover" />
                <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.78)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
              </>
            ) : undefined
          }
        >
          <View style={st.art}>
            {!stamp && (
              <View style={st.personalize}>
                <RoundIcon icon="color-palette-outline" label={strings.premium.personalize} filled onPress={() => router.push(premium ? '/customize' : '/premium')} />
              </View>
            )}
            {!shown && !stamp && (
              <Pressable accessibilityRole="button" onPress={addPhoto} style={({ pressed }) => [st.addPhoto, pressed && { opacity: 0.75 }]}>
                <Ionicons name="camera" size={18} color={colors.dark} />
                <Text style={st.addPhotoText} numberOfLines={1}>{strings.premium.addPhoto}</Text>
              </Pressable>
            )}
            {!shown && (
              <>
                <View style={st.giftFloat}>
                  <Icon name="gift" size={76} float />
                </View>
                <Icon name={cd.isToday ? 'confetti' : 'santa'} size={190} float />
                <View style={st.deer}>
                  <Icon name="deer" size={120} />
                </View>
              </>
            )}
          </View>

          <H1 style={st.heroTitle}>{cd.isToday ? s.merry : s.coming}</H1>

          {!cd.isToday && (
            <View style={st.units}>
              {([
                [cd.days, s.days],
                [cd.hours, s.hours],
                [cd.minutes, s.minutes],
                [cd.seconds, s.seconds],
              ] as const).map(([value, label], i) => (
                <View key={label} style={st.unit}>
                  <Text style={[st.unitValue, i === 0 && { color: colors.yellow }]}>
                    {i === 0 ? formatNumber(value) : String(value).padStart(2, '0')}
                  </Text>
                  <Text style={st.unitLabel} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={st.heroFoot}>
            <Icon name="firecracker" size={40} style={{ transform: [{ rotate: '-90deg' }] }} />
            <P muted style={{ flex: 1 }}>{cd.isToday ? s.today : s.until}</P>
            <CircleButton label={strings.advent.title} onPress={() => router.push(door ? `/door/${door}` : '/advent')} />
          </View>
          {stamp && <Text style={st.stamp}>🎄 Christmas Countdown</Text>}
        </Card>
      </View>

      {/* Try-before-you-buy: the photo is already on the card, Premium keeps it. */}
      {!!previewPhoto && (
        <Card inner={{ gap: 10 }}>
          <View style={st.keepRow}>
            <Icon name="sparkles" size={40} />
            <P style={{ flex: 1, fontSize: 16 }}>{strings.premium.keepTitle}</P>
          </View>
          <Button title={strings.premium.keep} chevrons onPress={() => router.push('/premium')} />
          <TextButton title={strings.premium.removePhoto} onPress={clearPhoto} />
        </Card>
      )}

      {/* Notification-style pill: today's advent door. */}
      <Pressable
        onPress={() => {
          haptic.tap();
          router.push(door ? `/door/${door}` : '/advent');
        }}
      >
        <Card inner={st.pillInner}>
          <View style={st.pillText}>
            <P style={{ fontSize: 15 }}>{door ? s.doorReady : fmt(s.adventSoon, { date: formatDayMonth(doorDate(now, 1)) })}</P>
          </View>
          <Icon name="star" size={48} />
        </Card>
      </Pressable>

      {/* The widget can't add itself (iOS rule), so show it and how to place it. */}
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          haptic.tap();
          router.push('/widget');
        }}
      >
        <Card inner={st.widgetInner}>
          <WidgetPreview width={84} />
          <View style={{ flex: 1, gap: 4 }}>
            <P style={{ fontSize: 16 }}>{strings.widget.cta}</P>
            <Text style={st.widgetMore}>{strings.widget.title} ›</Text>
          </View>
        </Card>
      </Pressable>

      <View style={st.grid}>
        <InfoTile icon="calendar" title={strings.tabs.advent} value={door ? fmt(strings.advent.day, { n: door }) : formatDayMonth(doorDate(now, 1))} onPress={() => router.push('/advent')} />
        <InfoTile icon="santa" title={strings.tabs.santa} value={fmt(strings.santa.people, { n: santa.people.length })} onPress={() => router.push('/santa')} />
      </View>
      <View style={st.grid}>
        <InfoTile icon="halo" title={strings.tabs.scanner} value={strings.scanner.title} onPress={() => router.push('/scanner')} />
        <InfoTile icon="socks" title={strings.tabs.gifts} value={budget ? `${formatMoney(spent)} / ${formatMoney(budget)}` : formatMoney(spent)} onPress={() => router.push('/gifts')} />
      </View>
    </Scene>
  );
}

const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: colors.white, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 16 },
  heroInner: { paddingTop: 8, gap: 16 },
  art: { height: 230, alignItems: 'center', justifyContent: 'flex-end' },
  giftFloat: { position: 'absolute', top: 6, end: 6 },
  deer: { position: 'absolute', bottom: 0, end: 4 },
  heroTitle: { fontSize: 42, lineHeight: 46 },
  units: { flexDirection: 'row', gap: 8 },
  unit: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: 'rgba(8,42,21,0.35)',
    alignItems: 'center',
  },
  unitValue: { color: colors.white, fontFamily: fonts.black, fontWeight: weights.black, fontSize: 28, fontVariant: ['tabular-nums'] },
  unitLabel: { color: colors.muted, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 12 },
  heroFoot: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  personalize: { position: 'absolute', top: 6, start: 0, zIndex: 2 },
  stamp: { color: 'rgba(255,255,255,0.75)', fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 13, textAlign: 'center', marginTop: -4 },
  addPhoto: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '62%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.yellow,
  },
  addPhotoText: { color: colors.dark, fontFamily: fonts.bold, fontWeight: weights.bold, fontSize: 15, flexShrink: 1 },
  keepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  widgetInner: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  widgetMore: { color: colors.yellow, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 14 },
  pillInner: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  pillText: { flex: 1, backgroundColor: 'rgba(8,42,21,0.35)', borderRadius: radius.pill, paddingVertical: 12, paddingHorizontal: 18 },
  grid: { flexDirection: 'row', gap: 12 },
});
