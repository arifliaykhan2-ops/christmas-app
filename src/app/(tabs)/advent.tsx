import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Accent, Card, Chip, H1, Icon, P, Scene, haptic } from '@/components/ui';
import { fmt, formatDayMonth, strings, useI18nVersion } from '@/i18n';
import { DOORS } from '@/lib/advent';
import { doorDate, isDoorOpen, todaysDoor } from '@/lib/christmas';
import { useStored } from '@/lib/storage';
import { colors, fonts, radius, weights } from '@/lib/theme';

export default function AdventScreen() {
  useI18nVersion();
  const s = strings.advent;
  const [opened] = useStored<number[]>('advent.opened', []);
  const [now, setNow] = useState(() => new Date());
  useFocusEffect(useCallback(() => setNow(new Date()), []));
  const today = todaysDoor(now);

  return (
    <Scene>
      <View style={st.head}>
        <View style={{ flex: 1, gap: 4 }}>
          <H1>{s.title}</H1>
          <Accent>{fmt(s.progress, { n: opened.length })}</Accent>
        </View>
        <Icon name="calendar" size={92} float />
      </View>

      <Card inner={st.gridCard}>
        <View style={st.grid}>
          {DOORS.map((door, i) => {
            const day = i + 1;
            const open = isDoorOpen(now, day);
            const seen = opened.includes(day);
            const isToday = today === day;
            return (
              <Pressable
                key={day}
                accessibilityRole="button"
                accessibilityLabel={fmt(s.day, { n: day })}
                onPress={() => {
                  if (!open) {
                    haptic.tap();
                    Alert.alert(fmt(s.day, { n: day }), fmt(s.opensOn, { date: formatDayMonth(doorDate(now, day)) }));
                    return;
                  }
                  haptic.press();
                  router.push(`/door/${day}`);
                }}
                style={({ pressed }) => [st.cell, pressed && { transform: [{ scale: 0.94 }] }]}
              >
                <View style={[st.door, isToday && st.today, !open && { opacity: 0.55 }]}>
                  {seen ? <Icon name={door.icon} size={38} /> : <Text style={[st.num, isToday && { color: colors.dark }]}>{day}</Text>}
                  {!open && <Text style={st.lock}>🔒</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card inner={st.games}>
        <Icon name="snowman" size={64} />
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={st.gamesTitle}>{s.games}</Text>
          <P muted style={{ fontSize: 14 }}>{strings.games.catchHint}</P>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip label={`❄️  ${strings.games.catchTitle}`} onPress={() => router.push('/game/catch')} />
            <Chip label={`🎁  ${strings.games.memoryTitle}`} onPress={() => router.push('/game/memory')} />
          </View>
        </View>
      </Card>
    </Scene>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 6 },
  gridCard: { padding: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '25%', padding: 5 },
  door: {
    aspectRatio: 0.86,
    borderRadius: radius.md,
    backgroundColor: colors.tile,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tileBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: { backgroundColor: colors.white },
  num: { color: colors.white, fontFamily: fonts.black, fontWeight: weights.black, fontSize: 28 },
  lock: { position: 'absolute', bottom: 6, end: 8, fontSize: 11 },
  games: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  gamesTitle: { color: colors.white, fontFamily: fonts.bold, fontWeight: weights.bold, fontSize: 19 },
});
