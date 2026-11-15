import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Image, type ImageStyle } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Animated,
  Image as RNImage,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { icons3d, snowfall, ui, type Icon3D } from '@/lib/assets';
import { useSettings } from '@/lib/settings';
import { cardGradient, colors, fonts, radius, weights } from '@/lib/theme';

export const haptic = {
  tap: () => Haptics.selectionAsync().catch(() => {}),
  press: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
};

/* ------------------------------- Background ------------------------------- */

/** Deterministic sparkle layout: a few crisp snowflakes and a few soft, blurred ones. */
function Sparkles() {
  const { width, height } = useWindowDimensions();
  const items = useMemo(() => {
    const crisp = [
      [0.08, 0.06, 18], [0.88, 0.12, 22], [0.62, 0.28, 14], [0.06, 0.42, 20], [0.93, 0.47, 16],
      [0.18, 0.66, 14], [0.8, 0.72, 24], [0.45, 0.86, 16], [0.03, 0.9, 18], [0.7, 0.95, 14],
    ];
    const soft = [[0.82, 0.3, 90], [0.1, 0.18, 70], [0.6, 0.6, 80], [0.2, 0.82, 96]];
    return { crisp, soft };
  }, []);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {items.soft.map(([x, y, s], i) => (
        <Image key={`s${i}`} source={ui.sparkleBlur} style={{ position: 'absolute', left: x * width - s / 2, top: y * height - s / 2, width: s, height: s, opacity: 0.55 }} />
      ))}
      {items.crisp.map(([x, y, s], i) => (
        <Image key={`c${i}`} source={ui.sparkle} style={{ position: 'absolute', left: x * width, top: y * height, width: s, height: s, opacity: 0.85 }} />
      ))}
    </View>
  );
}

export function Backdrop() {
  const { snow } = useSettings();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#1f5d31', colors.bg, colors.bgDeep]} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      <RNImage source={ui.grain} resizeMode="repeat" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} />
      <Sparkles />
      {snow && Platform.OS !== 'web' && <LottieView source={snowfall} autoPlay loop resizeMode="cover" style={StyleSheet.absoluteFill} />}
    </View>
  );
}

/** Screen shell: green grainy backdrop, safe-area padding, optional scroll. */
export function Scene({ children, scroll = true, contentStyle }: { children: ReactNode; scroll?: boolean; contentStyle?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + 14, paddingBottom: 120, paddingHorizontal: 18, gap: 14 };
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Backdrop />
      {scroll ? (
        <ScrollView contentContainerStyle={[pad, contentStyle]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, pad, contentStyle]}>{children}</View>
      )}
    </View>
  );
}

/* --------------------------------- Surfaces -------------------------------- */

/** Big rounded green card from the reference. */
export function Card({
  children,
  style,
  inner,
  gradient,
  background,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  inner?: StyleProp<ViewStyle>;
  /** Override the card colours (Premium themes). */
  gradient?: readonly [string, string, ...string[]];
  /** Optional layer under the content, e.g. the user's photo. */
  background?: ReactNode;
}) {
  return (
    <View style={[st.card, style]}>
      <LinearGradient colors={gradient ?? cardGradient} start={{ x: 0, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
      {background}
      <RNImage source={ui.grain} resizeMode="repeat" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} />
      <View style={[st.cardInner, inner]}>{children}</View>
    </View>
  );
}

/** Small lighter tile used in 2×2 grids. */
export function Tile({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const body = <View style={[st.tile, style]}>{children}</View>;
  if (!onPress) return body;
  return (
    <Pressable
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }, style && { flex: (StyleSheet.flatten(style) as ViewStyle).flex }]}
    >
      {body}
    </Pressable>
  );
}

/** Info tile: 3D icon, bold title, muted value (Gift buddy / Date / Budget …). */
export function InfoTile({ icon, title, value, onPress }: { icon: Icon3D; title: string; value?: string; onPress?: () => void }) {
  return (
    <Tile style={st.infoTile} onPress={onPress}>
      <Icon name={icon} size={46} />
      <View style={{ gap: 2 }}>
        <Text style={st.tileTitle} numberOfLines={1}>{title}</Text>
        {!!value && <Text style={st.tileValue} numberOfLines={1}>{value}</Text>}
      </View>
    </Tile>
  );
}

/** A Fluent 3D element, optionally gently floating. */
export function Icon({ name, size = 64, float, style }: { name: Icon3D; size?: number; float?: boolean; style?: StyleProp<ImageStyle> }) {
  const [y] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!float) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -7, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float, y]);
  return (
    <Animated.View style={{ transform: [{ translateY: y }] }}>
      <Image source={icons3d[name]} style={[{ width: size, height: size }, style]} contentFit="contain" />
    </Animated.View>
  );
}

/* ---------------------------------- Text ---------------------------------- */

export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[st.h1, style]}>{children}</Text>;
}

export function H2({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[st.h2, style]}>{children}</Text>;
}

/** The yellow sub-heading ("Secret Santa", "12 people"). */
export function Accent({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[st.accent, style]}>{children}</Text>;
}

export function P({ children, muted, center, style }: { children: ReactNode; muted?: boolean; center?: boolean; style?: StyleProp<TextStyle> }) {
  return <Text style={[st.p, muted && { color: colors.muted }, center && { textAlign: 'center' }, style]}>{children}</Text>;
}

export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[st.label, style]}>{children}</Text>;
}

/* --------------------------------- Buttons -------------------------------- */

/** White pill with dark text (primary) or dark pill with white text. */
export function Button({
  title,
  onPress,
  disabled,
  variant = 'light',
  style,
  chevrons,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'light' | 'dark' | 'red';
  style?: StyleProp<ViewStyle>;
  chevrons?: boolean;
}) {
  const bg = variant === 'light' ? colors.white : variant === 'red' ? colors.red : colors.dark;
  const fg = variant === 'light' ? colors.dark : colors.white;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        haptic.press();
        onPress();
      }}
      style={({ pressed }) => [st.btn, { backgroundColor: bg, opacity: disabled ? 0.45 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}
    >
      <Text style={[st.btnText, { color: fg }]} numberOfLines={1} adjustsFontSizeToFit>
        {title}
        {chevrons ? '  ›››' : ''}
      </Text>
    </Pressable>
  );
}

/** The "Continue ››› | Let it snow" pill pair. */
export function Segmented({ left, right, onLeft, onRight }: { left: string; right: string; onLeft: () => void; onRight: () => void }) {
  return (
    <View style={st.segment}>
      <Button title={left} onPress={onLeft} chevrons style={{ flex: 1.15 }} />
      <Pressable
        onPress={() => {
          haptic.tap();
          onRight();
        }}
        style={({ pressed }) => [st.segmentRight, pressed && { opacity: 0.7 }]}
        accessibilityRole="button"
      >
        <Text style={st.segmentText} numberOfLines={1} adjustsFontSizeToFit>{right}</Text>
      </Pressable>
    </View>
  );
}

/** Round outlined arrow button. */
export function CircleButton({ onPress, icon = 'arrow-forward', size = 64, label }: { onPress: () => void; icon?: keyof typeof Ionicons.glyphMap; size?: number; label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptic.press();
        onPress();
      }}
      style={({ pressed }) => [st.circle, { width: size, height: size, borderRadius: size / 2 }, pressed && { backgroundColor: 'rgba(255,255,255,0.12)' }]}
    >
      <Ionicons name={icon} size={size * 0.38} color={colors.white} style={{ transform: [{ scaleX: 1 }] }} />
    </Pressable>
  );
}

/** Small round icon button used in headers (back, settings, menu). */
export function RoundIcon({ icon, onPress, label, filled }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; label?: string; filled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => [st.roundIcon, filled && { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'transparent' }, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name={icon} size={20} color={colors.white} />
    </Pressable>
  );
}

/** Title row for modal screens with an always-visible "Done" pill on the right. */
export function ModalHeader({ title, onDone, doneLabel }: { title?: string; onDone: () => void; doneLabel: string }) {
  return (
    <View style={st.modalHeader}>
      <View style={{ flex: 1 }}>{!!title && <H1 style={{ fontSize: 32, lineHeight: 38 }}>{title}</H1>}</View>
      <Pressable
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => {
          haptic.tap();
          onDone();
        }}
        style={({ pressed }) => [st.donePill, pressed && { opacity: 0.7 }]}
      >
        <Text style={st.doneText}>{doneLabel}</Text>
      </Pressable>
    </View>
  );
}

export function TextButton({ title, onPress, danger }: { title: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [st.textBtn, pressed && { opacity: 0.6 }]}>
      <Text style={[st.textBtnText, danger && { color: colors.danger }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, on, onPress, style }: { label: string; on?: boolean; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => [st.chip, on && st.chipOn, pressed && { transform: [{ scale: 0.96 }] }, style]}
    >
      <Text style={[st.chipText, on && { color: colors.dark }]}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.faint} {...props} style={[st.field, props.style]} />;
}

/* ------------------------------- List rows -------------------------------- */

const AVATARS: Icon3D[] = ['santa', 'elf', 'mrsClaus', 'snowman', 'deer', 'penguin', 'halo', 'gift'];

/** Participant row: 3D avatar, name, sub-line and a "…" button. */
export function PersonRow({
  index,
  title,
  subtitle,
  onPress,
  onMenu,
  right,
}: {
  index: number;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  onMenu?: () => void;
  right?: ReactNode;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={() => {
        haptic.tap();
        onPress?.();
      }}
      style={({ pressed }) => [st.row, pressed && { opacity: 0.75 }]}
    >
      <View style={st.avatar}>
        <Icon name={AVATARS[index % AVATARS.length]} size={34} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={st.rowTitle} numberOfLines={1}>{title}</Text>
        {!!subtitle && <Text style={st.rowSub} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {right}
      {onMenu && (
        <Pressable hitSlop={10} onPress={onMenu} accessibilityRole="button">
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.white} />
        </Pressable>
      )}
    </Pressable>
  );
}

/* --------------------------------- Styles --------------------------------- */

const st = StyleSheet.create({
  card: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.10)' },
  cardInner: { padding: 20, gap: 14 },
  tile: {
    borderRadius: radius.md,
    backgroundColor: colors.tile,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tileBorder,
    padding: 14,
  },
  infoTile: { flex: 1, minHeight: 128, justifyContent: 'space-between', gap: 10 },
  tileTitle: { color: colors.white, fontFamily: fonts.bold, fontWeight: weights.bold, fontSize: 17 },
  tileValue: { color: colors.muted, fontFamily: fonts.body, fontWeight: weights.body, fontSize: 14 },
  h1: { color: colors.white, fontFamily: fonts.black, fontWeight: weights.black, fontSize: 38, lineHeight: 42, letterSpacing: -0.5 },
  h2: { color: colors.white, fontFamily: fonts.bold, fontWeight: weights.bold, fontSize: 22, lineHeight: 28 },
  accent: { color: colors.yellow, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 20 },
  p: { color: colors.white, fontFamily: fonts.body, fontWeight: weights.body, fontSize: 16, lineHeight: 23 },
  label: { color: colors.muted, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 13, letterSpacing: 0.3 },
  btn: { borderRadius: radius.pill, minHeight: 58, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: fonts.bold, fontWeight: weights.bold, fontSize: 17 },
  segment: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.dark, borderRadius: radius.pill, padding: 4 },
  segmentRight: { flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  segmentText: { color: colors.white, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 16 },
  circle: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  roundIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  donePill: { backgroundColor: colors.white, borderRadius: radius.pill, paddingVertical: 10, paddingHorizontal: 18 },
  doneText: { color: colors.dark, fontFamily: fonts.bold, fontWeight: weights.bold, fontSize: 16 },
  textBtn: { paddingVertical: 12, alignItems: 'center' },
  textBtnText: { color: colors.muted, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 15 },
  chip: {
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
  },
  chipOn: { backgroundColor: colors.white },
  chipText: { color: colors.white, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 14 },
  field: {
    minWidth: 0,
    backgroundColor: 'rgba(8,42,21,0.55)',
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 15,
    color: colors.white,
    fontFamily: fonts.body,
    fontWeight: weights.body,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.tile,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tileBorder,
  },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.bgDeep, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { color: colors.white, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 17 },
  rowSub: { color: colors.muted, fontFamily: fonts.body, fontWeight: weights.body, fontSize: 13 },
});
