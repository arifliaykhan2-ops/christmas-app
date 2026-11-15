import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Accent, Button, Card, H1, Icon, P, Scene, TextButton, haptic } from '@/components/ui';
import { closeModal } from '@/lib/nav';
import { fmt, strings, useI18nVersion } from '@/i18n';
import { icons3d, type Icon3D } from '@/lib/assets';
import { useStored } from '@/lib/storage';
import { colors, fonts, radius, weights } from '@/lib/theme';

export default function GameScreen() {
  useI18nVersion();
  const { kind } = useLocalSearchParams<{ kind: string }>();
  if (kind === 'memory') return <MemoryGame />;
  return <CatchGame fast={kind === 'catch-fast'} />;
}

/* ---------------------------- Catch the snowflakes ---------------------------- */

type Flake = { id: number; x: number; size: number; y: Animated.Value };
const ROUND_SECONDS = 25;

function CatchGame({ fast }: { fast: boolean }) {
  const g = strings.games;
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [flakes, setFlakes] = useState<Flake[]>([]);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(ROUND_SECONDS);
  const [best, setBest] = useStored<number>(`game.best.${fast ? 'fast' : 'catch'}`, 0);
  const nextId = useRef(0);

  // Round over: runs from the round timer, reading the latest score.
  const finish = useEffectEvent(() => {
    setPhase('done');
    setFlakes([]);
    if (score > best) setBest(score);
    haptic.success();
  });

  const remove = useCallback((id: number) => setFlakes((f) => f.filter((x) => x.id !== id)), []);

  useEffect(() => {
    if (phase !== 'play') return;
    const fall = fast ? 2600 : 4000;
    const spawn = setInterval(() => {
      const size = 44 + Math.random() * 26;
      const flake: Flake = { id: nextId.current++, x: Math.random() * (width - size), size, y: new Animated.Value(-size) };
      setFlakes((f) => [...f, flake]);
      Animated.timing(flake.y, { toValue: height, duration: fall * (0.8 + Math.random() * 0.4), easing: Easing.linear, useNativeDriver: true }).start(
        ({ finished }) => finished && remove(flake.id),
      );
    }, fast ? 380 : 600);
    const tick = setInterval(() => setLeft((l) => l - 1), 1000);
    const end = setTimeout(finish, ROUND_SECONDS * 1000);
    return () => {
      clearInterval(spawn);
      clearInterval(tick);
      clearTimeout(end);
    };
  }, [phase, fast, width, height, remove]);


  function start() {
    setScore(0);
    setLeft(ROUND_SECONDS);
    setFlakes([]);
    setPhase('play');
  }

  if (phase !== 'play') {
    return (
      <Scene contentStyle={st.center}>
        <Icon name={phase === 'done' ? 'glowingStar' : 'snowflake'} size={140} float style={{ alignSelf: 'center' }} />
        <Card>
          <H1 style={{ textAlign: 'center', fontSize: 32 }}>{phase === 'done' ? g.finished : g.catchTitle}</H1>
          <P muted center>{phase === 'done' ? fmt(g.score, { n: score }) : g.catchHint}</P>
          {best > 0 && <Accent style={{ textAlign: 'center' }}>★ {best}</Accent>}
          <Button title={phase === 'done' ? g.again : g.start} chevrons onPress={start} />
        </Card>
        <TextButton title={strings.common.close} onPress={closeModal} />
      </Scene>
    );
  }

  return (
    <Scene scroll={false}>
      <View style={[st.hud, { top: insets.top + 8 }]}>
        <Text style={st.hudText}>{fmt(g.score, { n: score })}</Text>
        <Text style={st.hudText}>{fmt(g.time, { n: Math.max(0, left) })}</Text>
      </View>
      {flakes.map((f) => (
        <Animated.View key={f.id} style={[st.flake, { left: f.x, width: f.size, height: f.size, transform: [{ translateY: f.y }] }]}>
          <Pressable
            hitSlop={10}
            onPressIn={() => {
              haptic.tap();
              setScore((s) => s + 1);
              remove(f.id);
            }}
            style={StyleSheet.absoluteFill}
          >
            <Image source={icons3d.snowflake} style={StyleSheet.absoluteFill} contentFit="contain" />
          </Pressable>
        </Animated.View>
      ))}
    </Scene>
  );
}

/* ------------------------------- Memory pairs -------------------------------- */

const MEMORY_ICONS: Icon3D[] = ['santa', 'tree', 'gift', 'snowman', 'deer', 'bell', 'cookie', 'candle'];

type MemoryCard = { id: number; icon: Icon3D; matched: boolean };

function shuffled(): MemoryCard[] {
  const deck = [...MEMORY_ICONS, ...MEMORY_ICONS].map((icon, i) => ({ id: i, icon, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function MemoryGame() {
  const g = strings.games;
  const [cards, setCards] = useState<MemoryCard[]>(shuffled);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useStored<number>('game.best.memory', 0);
  const done = cards.every((c) => c.matched);

  useEffect(() => {
    if (done) {
      haptic.success();
      if (!best || moves < best) setBest(moves);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function flip(index: number) {
    if (flipped.length === 2 || flipped.includes(index) || cards[index].matched) return;
    haptic.tap();
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (cards[a].icon === cards[b].icon) {
        setTimeout(() => {
          setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
          setFlipped([]);
        }, 350);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  }

  function restart() {
    setCards(shuffled());
    setFlipped([]);
    setMoves(0);
  }

  return (
    <Scene>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <H1>{g.memoryTitle}</H1>
        <P muted center>{done ? g.finished : g.memoryHint}</P>
        <Accent>
          {fmt(g.moves, { n: moves })}
          {best ? `   ★ ${best}` : ''}
        </Accent>
      </View>
      <View style={st.memoryGrid}>
        {cards.map((c, i) => {
          const up = c.matched || flipped.includes(i);
          return (
            <Pressable key={c.id} onPress={() => flip(i)} style={st.memoryCell} accessibilityRole="button">
              <View style={[st.card, up && st.cardUp, c.matched && { opacity: 0.55 }]}>
                {up ? <Icon name={c.icon} size={48} /> : <Text style={st.cardBack}>✳</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
      {done && <Button title={g.again} chevrons onPress={restart} />}
      <TextButton title={strings.common.close} onPress={closeModal} />
    </Scene>
  );
}

const st = StyleSheet.create({
  center: { flexGrow: 1, justifyContent: 'center' },
  hud: { position: 'absolute', start: 18, end: 18, flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  hudText: { color: colors.white, fontFamily: fonts.black, fontWeight: weights.black, fontSize: 24 },
  flake: { position: 'absolute', top: 0 },
  memoryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  memoryCell: { width: '25%', padding: 5 },
  card: { aspectRatio: 0.8, borderRadius: radius.md, backgroundColor: colors.tile, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.tileBorder, alignItems: 'center', justifyContent: 'center' },
  cardUp: { backgroundColor: colors.white },
  cardBack: { color: colors.white, fontSize: 26, opacity: 0.8 },
});
