import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { formatNumber, strings } from '@/i18n';
import { countdown } from '@/lib/christmas';
import { THEMES } from '@/lib/personalize';
import { usePremium } from '@/lib/premium';
import { useSettings } from '@/lib/settings';
import { colors } from '@/lib/theme';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * In-app look-alike of the SwiftUI Home Screen widget (targets/widget/index.swift):
 * "39 DAYS", a live hh:mm:ss timer, the photo/theme and the "Add your photo" hint free users see.
 */
export function WidgetPreview({ size = 'small', width = 158 }: { size?: 'small' | 'medium'; width?: number }) {
  const { mode, theme, photo } = useSettings();
  const premium = usePremium().active;
  const s = strings.countdown;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const cd = countdown(now, mode);
  const t = cd.isToday ? { days: 0, hours: 0, minutes: 0, seconds: 0 } : cd;
  const k = width / 158; // 158pt = iPhone small widget
  const medium = size === 'medium';
  const w = medium ? width * 2.13 : width;

  const days = (big: number) => (
    <View style={st.daysRow}>
      <Text style={[st.days, { fontSize: big * k, lineHeight: big * 1.08 * k }]} numberOfLines={1}>
        {formatNumber(t.days)}
      </Text>
      <Text style={[st.label, { fontSize: big * 0.24 * k }]} numberOfLines={1}>{s.days.toLocaleUpperCase()}</Text>
    </View>
  );
  const timer = (font: number) => (
    <View style={[st.timerBox, { borderRadius: 10 * k, paddingHorizontal: 10 * k, paddingVertical: 3 * k }]}>
      <Text style={[st.timer, { fontSize: font * k }]}>{`${t.hours}:${pad(t.minutes)}:${pad(t.seconds)}`}</Text>
    </View>
  );
  const hint = !premium && (
    <Text style={[st.hint, { fontSize: 10 * k }]} numberOfLines={1}>✨ {strings.premium.addPhoto}</Text>
  );
  const merry = (font: number) => (
    <Text style={[st.days, { fontSize: font * k, textAlign: medium ? 'left' : 'center' }]}>{s.merry}</Text>
  );

  return (
    <View style={[st.box, { width: w, height: width, borderRadius: 22 * k }]}>
      {photo ? (
        <>
          <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.65)']} style={StyleSheet.absoluteFill} />
        </>
      ) : (
        <LinearGradient colors={[THEMES[theme].top, THEMES[theme].bottom]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      )}
      {medium ? (
        <View style={[st.row, { padding: 16 * k, gap: 12 * k }]}>
          {!photo && <Icon name={cd.isToday ? 'santa' : 'tree'} size={90 * k} />}
          <View style={{ flex: 1, gap: 4 * k, alignItems: 'flex-start' }}>
            {cd.isToday ? merry(26) : (
              <>
                {days(50)}
                {timer(22)}
                <Text style={[st.until, { fontSize: 14 * k }]} numberOfLines={1}>{s.until}</Text>
              </>
            )}
            {hint}
          </View>
        </View>
      ) : (
        <View style={[st.col, { padding: 10 * k, gap: 3 * k }]}>
          {photo ? <View style={{ flex: 1 }} /> : <Icon name={cd.isToday ? 'santa' : 'tree'} size={38 * k} />}
          {cd.isToday ? merry(20) : (
            <>
              {days(38)}
              {timer(16)}
            </>
          )}
          {hint}
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  box: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.18)' },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  col: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  daysRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  days: { color: '#fff7e8', fontFamily: 'Georgia', fontWeight: '800', fontVariant: ['tabular-nums'] },
  label: { color: colors.yellow, fontWeight: '700', letterSpacing: 1.2 },
  timerBox: { backgroundColor: 'rgba(0,0,0,0.22)' },
  timer: { color: '#fff7e8', fontWeight: '700', fontVariant: ['tabular-nums'] },
  until: { color: '#fff7e8', fontFamily: 'Georgia', fontStyle: 'italic', fontWeight: '600' },
  hint: { color: colors.yellow, fontWeight: '700' },
});
