import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Accent, Button, Card, H1, Icon, ModalHeader, Scene, TextButton, haptic } from '@/components/ui';
import { closeModal } from '@/lib/nav';
import { fmt, lang, strings, useI18nVersion } from '@/i18n';
import { VERSES } from '@/i18n/verses';
import { DOORS } from '@/lib/advent';
import { isDoorOpen } from '@/lib/christmas';
import { useStored } from '@/lib/storage';
import { colors, fonts, weights } from '@/lib/theme';

export default function DoorScreen() {
  useI18nVersion();
  const { day: raw } = useLocalSearchParams<{ day: string }>();
  const day = Math.min(24, Math.max(1, Number(raw) || 1));
  const door = DOORS[day - 1];
  const s = strings.advent;
  const [, setOpened, loaded] = useStored<number[]>('advent.opened', []);
  const open = isDoorOpen(new Date(), day);

  useEffect(() => {
    if (!loaded || !open) return;
    haptic.success();
    setOpened((prev) => (prev.includes(day) ? prev : [...prev, day].sort((a, b) => a - b)));
  }, [loaded, open, day, setOpened]);

  if (!open) {
    return (
      <Scene contentStyle={st.content}>
        <Icon name="locked" size={120} style={{ alignSelf: 'center' }} />
        <TextButton title={strings.common.close} onPress={closeModal} />
      </Scene>
    );
  }

  const kindLabel = { idea: s.idea, fact: s.fact, game: s.game, eve: s.eve }[door.kind];
  const verse = VERSES[lang].items[day - 1];

  return (
    <Scene contentStyle={st.content}>
      <ModalHeader doneLabel={strings.common.close} onDone={closeModal} />
      <Accent style={{ textAlign: 'center' }}>{fmt(s.day, { n: day })}</Accent>
      <View style={st.hero}>
        <Icon name={door.icon} size={170} float />
        {door.kind === 'eve' && (
          <View style={st.confetti}>
            <Icon name="confetti" size={64} />
            <Icon name="sparkles" size={52} />
            <Icon name="partyPopper" size={64} />
          </View>
        )}
      </View>
      {/* Bible verse of the day — the 24 verses tell the Christmas story in order. */}
      <Card inner={st.verseCard}>
        <Text style={st.quoteMark}>“</Text>
        {verse.text ? <Text style={st.verse}>{verse.text}</Text> : null}
        <Accent style={st.ref}>📖 {verse.ref}</Accent>
      </Card>
      <Card>
        <Accent style={{ fontSize: 16 }}>{kindLabel}</Accent>
        <H1 style={{ fontSize: 26, lineHeight: 32 }}>{s.items[day - 1]}</H1>
        {door.game && (
          <Button title={s.play} chevrons onPress={() => router.push(`/game/${door.game}`)} />
        )}
      </Card>
    </Scene>
  );
}

const st = StyleSheet.create({
  content: { paddingTop: 40, justifyContent: 'center', flexGrow: 1 },
  hero: { alignItems: 'center', paddingVertical: 8 },
  confetti: { flexDirection: 'row', gap: 18, marginTop: 8 },
  verseCard: { gap: 6, paddingTop: 10 },
  quoteMark: { color: colors.yellow, fontFamily: fonts.black, fontWeight: weights.black, fontSize: 56, lineHeight: 56, marginBottom: -18 },
  verse: { color: colors.white, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 19, lineHeight: 27 },
  ref: { fontSize: 15 },
});
