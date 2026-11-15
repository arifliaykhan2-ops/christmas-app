import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useEffect, useEffectEvent, useRef, useState, type ComponentRef } from 'react';
import { Alert, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { Accent, Button, H1, Icon, Label, P, Scene, TextButton, haptic } from '@/components/ui';
import { fmt, strings, useI18nVersion } from '@/i18n';
import { usePremium } from '@/lib/premium';
import { colors, fonts, radius, weights } from '@/lib/theme';

type Verdict = { nice: boolean; percent: number; reason: string };
type Secret = 'random' | 'nice' | 'naughty';
const SCAN_MS = 2600;

function decide(secret: Secret): Verdict {
  const s = strings.scanner;
  const nice = secret === 'random' ? Math.random() < 0.75 : secret === 'nice';
  const percent = nice ? 70 + Math.floor(Math.random() * 30) : 8 + Math.floor(Math.random() * 35);
  const list = nice ? s.niceReasons : s.naughtyReasons;
  return { nice, percent, reason: list[Math.floor(Math.random() * list.length)] };
}

export default function ScannerScreen() {
  useI18nVersion();
  const s = strings.scanner;
  // Dev-only shortcut used to render App Store screenshots ("?demo=nice" / "?demo=naughty").
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  const demoVerdict = __DEV__ && (demo === 'nice' || demo === 'naughty') ? decide(demo) : null;
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'result'>(demoVerdict ? 'result' : 'idle');
  const [verdict, setVerdict] = useState<Verdict | null>(demoVerdict);
  const [secret, setSecret] = useState<Secret>('random');
  const [line] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultRef = useRef<ComponentRef<typeof View>>(null);
  const premium = usePremium().active;
  const [stamp, setStamp] = useState(false);

  function stopTimers() {
    if (timer.current) clearTimeout(timer.current);
    if (ticker.current) clearInterval(ticker.current);
    line.stopAnimation();
    pulse.stopAnimation();
  }

  const onUnmount = useEffectEvent(stopTimers);
  useEffect(() => () => onUnmount(), []);

  function startScan() {
    setPhase('scanning');
    line.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(line, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(line, { toValue: 0, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true })).start();
    ticker.current = setInterval(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}), 220);
    timer.current = setTimeout(() => {
      stopTimers();
      setVerdict(decide(secret));
      setSecret('random');
      setPhase('result');
      haptic.success();
    }, SCAN_MS);
  }

  function cancelScan() {
    if (phase !== 'scanning') return;
    stopTimers();
    setPhase('idle');
  }

  function openSecret() {
    haptic.press();
    Alert.alert(s.secret, s.secretHint, [
      { text: `😇 ${s.nice}`, onPress: () => setSecret('nice') },
      { text: `😈 ${s.naughty}`, onPress: () => setSecret('naughty') },
      { text: s.random, onPress: () => setSecret('random') },
      { text: strings.common.cancel, style: 'cancel' },
    ]);
  }

  async function share() {
    try {
      if (!premium) {
        setStamp(true);
        await new Promise((r) => setTimeout(r, 80));
      }
      const uri = await captureRef(resultRef, { format: 'png', quality: 1 });
      setStamp(false);
      await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
    } catch {
      setStamp(false);
    }
  }

  return (
    <Scene>
      {/* Long-press Santa to open the secret parent mode. */}
      <Pressable onLongPress={openSecret} delayLongPress={900} style={st.head} accessibilityHint={s.secret}>
        <View style={{ flex: 1, gap: 4 }}>
          <H1 style={{ fontSize: 34, lineHeight: 38 }}>{s.title}</H1>
          <Accent style={{ fontSize: 17 }}>{phase === 'scanning' ? s.scanning : s.hint}</Accent>
        </View>
        <Icon name="elf" size={96} float />
        {secret !== 'random' && <View style={st.secretDot} />}
      </Pressable>

      {phase !== 'result' ? (
        <View style={st.padWrap}>
          <Animated.View
            pointerEvents="none"
            style={[
              st.ring,
              {
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [phase === 'scanning' ? 0.8 : 0.35, 0] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }],
              },
            ]}
          />
          <Pressable onPressIn={startScan} onPressOut={cancelScan} style={st.pad} accessibilityRole="button" accessibilityLabel={s.hint}>
            <LinearGradient colors={['#3d8049', '#1d4a28']} style={StyleSheet.absoluteFill} />
            <Text style={st.print}>⌾</Text>
            <Icon name="hand" size={110} />
            {phase === 'scanning' && (
              <Animated.View
                style={[st.scanLine, { transform: [{ translateY: line.interpolate({ inputRange: [0, 1], outputRange: [-100, 100] }) }] }]}
              />
            )}
          </Pressable>
        </View>
      ) : (
        verdict && (
          <>
            <View ref={resultRef} collapsable={false} style={st.resultCard}>
              <LinearGradient
                colors={verdict.nice ? ['#3d8049', '#1d4a28'] : ['#c62f38', '#6d1118']}
                style={StyleSheet.absoluteFill}
              />
              <Label style={{ textAlign: 'center' }}>{s.verdict}</Label>
              <Icon name={verdict.nice ? 'halo' : 'horns'} size={120} float />
              <Text style={st.verdict}>{verdict.nice ? s.nice : s.naughty}</Text>
              <Text style={st.percent}>{fmt(s.percent, { n: verdict.percent })}</Text>
              <P center style={{ fontStyle: 'italic' }}>“{verdict.reason}”</P>
              {stamp && <Text style={st.stamp}>🎄 Christmas Countdown</Text>}
            </View>
            <Button title={s.again} chevrons onPress={() => setPhase('idle')} />
            <TextButton title={`↗  ${strings.common.share}`} onPress={share} />
          </>
        )
      )}
    </Scene>
  );
}

const PAD = 220;

const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  secretDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.yellow, opacity: 0.6 },
  padWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  ring: { position: 'absolute', width: PAD, height: PAD, borderRadius: PAD / 2, borderWidth: 2, borderColor: colors.white },
  pad: {
    width: PAD,
    height: PAD,
    borderRadius: PAD / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  print: { position: 'absolute', fontSize: 180, color: 'rgba(255,255,255,0.10)' },
  scanLine: { position: 'absolute', start: 0, end: 0, height: 4, backgroundColor: colors.yellow, shadowColor: colors.yellow, shadowOpacity: 1, shadowRadius: 12 },
  resultCard: { borderRadius: radius.lg, overflow: 'hidden', padding: 24, alignItems: 'center', gap: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.tileBorder },
  verdict: { color: colors.white, fontFamily: fonts.black, fontWeight: weights.black, fontSize: 48, letterSpacing: 1 },
  stamp: { color: 'rgba(255,255,255,0.75)', fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 13, marginTop: 6 },
  percent: { color: colors.yellow, fontFamily: fonts.bold, fontWeight: weights.bold, fontSize: 20 },
});
