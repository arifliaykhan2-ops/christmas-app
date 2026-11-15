import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { formatNumber, strings } from '@/i18n';
import { countdown } from '@/lib/christmas';
import { THEMES } from '@/lib/personalize';
import { usePremium } from '@/lib/premium';
import { useSettings } from '@/lib/settings';
import { colors } from '@/lib/theme';

/**
 * In-app look-alike of the SwiftUI Home Screen widget (targets/widget/index.swift):
 * same colours, photo, day count and the "Add your photo" hint free users see.
 */
export function WidgetPreview({ size = 'small', width = 158 }: { size?: 'small' | 'medium'; width?: number }) {
  const { mode, theme, photo } = useSettings();
  const premium = usePremium().active;
  const s = strings.countdown;
  const cd = countdown(new Date(), mode);
  const k = width / 158; // 158pt = iPhone small widget
  const medium = size === 'medium';
  const w = medium ? width * 2.13 : width;

  const number = (
    <Text style={[st.days, { fontSize: (medium ? 58 : 46) * k, lineHeight: (medium ? 62 : 50) * k }]} numberOfLines={1} adjustsFontSizeToFit>
      {cd.isToday ? '🎄' : formatNumber(cd.days)}
    </Text>
  );
  const labels = !cd.isToday && (
    <>
      <Text style={[st.label, { fontSize: (medium ? 12 : 10) * k }]}>{s.days.toLocaleUpperCase()}</Text>
      <Text style={[st.until, { fontSize: (medium ? 15 : 11) * k }]} numberOfLines={1}>{s.until}</Text>
    </>
  );
  const hint = !premium && (
    <Text style={[st.hint, { fontSize: 10 * k }]} numberOfLines={1}>✨ {strings.premium.addPhoto}</Text>
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
        <View style={[st.row, { padding: 16 * k, gap: 14 * k }]}>
          {!photo && <Icon name="tree" size={96 * k} />}
          <View style={{ flex: 1 }}>
            {number}
            {labels}
            {hint}
          </View>
        </View>
      ) : (
        <View style={[st.col, { padding: 12 * k }]}>
          {photo ? <View style={{ flex: 1 }} /> : <Icon name="tree" size={44 * k} />}
          {number}
          {premium ? labels : (
            <>
              {!cd.isToday && <Text style={[st.label, { fontSize: 10 * k }]}>{s.days.toLocaleUpperCase()}</Text>}
              {hint}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  box: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.18)' },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  col: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  days: { color: '#fff7e8', fontFamily: 'Georgia', fontWeight: '800', fontVariant: ['tabular-nums'] },
  label: { color: colors.yellow, fontWeight: '700', letterSpacing: 1.2 },
  until: { color: '#fff7e8', fontFamily: 'Georgia', fontStyle: 'italic', fontWeight: '600' },
  hint: { color: colors.yellow, fontWeight: '700', marginTop: 2 },
});
