import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, H2, Icon, ModalHeader, Scene, TextButton, haptic } from '@/components/ui';
import { closeModal } from '@/lib/nav';
import { strings, useI18nVersion } from '@/i18n';
import { THEMES, THEME_IDS } from '@/lib/personalize';
import { usePremium } from '@/lib/premium';
import { useSettings } from '@/lib/settings';
import { colors, radius } from '@/lib/theme';

/** Premium: own photo + colour theme for the countdown card and the widget. */
export default function CustomizeScreen() {
  useI18nVersion();
  const s = strings.premium;
  const premium = usePremium().active;
  const { theme, setTheme, photo, choosePhoto, clearPhoto } = useSettings();

  const locked = () => router.push('/premium');

  async function pick() {
    if (!premium) return locked();
    try {
      await choosePhoto();
    } catch {
      Alert.alert(s.title, s.error);
    }
  }

  return (
    <Scene contentStyle={{ paddingTop: 30 }}>
      <ModalHeader title={s.personalize} doneLabel={strings.common.done} onDone={closeModal} />

      <Card>
        <H2>{s.photoTitle}</H2>
        <Pressable onPress={pick} style={st.preview} accessibilityRole="button" accessibilityLabel={s.choosePhoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <LinearGradient colors={THEMES[theme].colors} style={[StyleSheet.absoluteFill, st.center]}>
              <Icon name="house" size={70} />
            </LinearGradient>
          )}
          {!premium && (
            <View style={st.lock}>
              <Ionicons name="lock-closed" size={18} color={colors.dark} />
            </View>
          )}
        </Pressable>
        <Button title={s.choosePhoto} onPress={pick} />
        {!!photo && <TextButton danger title={s.removePhoto} onPress={clearPhoto} />}
      </Card>

      <Card>
        <H2>{s.theme}</H2>
        <View style={st.swatches}>
          {THEME_IDS.map((id) => {
            const on = theme === id;
            const isLocked = !premium && id !== 'pine';
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  haptic.tap();
                  if (isLocked) return locked();
                  setTheme(id);
                }}
                style={({ pressed }) => [st.swatchWrap, on && st.swatchOn, pressed && { transform: [{ scale: 0.94 }] }]}
              >
                <LinearGradient colors={THEMES[id].colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.swatch}>
                  {isLocked && <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.9)" />}
                  {on && <Ionicons name="checkmark" size={22} color={colors.white} />}
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {!premium && <Button title={s.title} chevrons variant="red" onPress={locked} />}
    </Scene>
  );
}

const st = StyleSheet.create({
  preview: { aspectRatio: 4 / 5, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.tile },
  center: { alignItems: 'center', justifyContent: 'center' },
  lock: {
    position: 'absolute',
    top: 12,
    end: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatchWrap: { padding: 3, borderRadius: 40, borderWidth: 2, borderColor: 'transparent' },
  swatchOn: { borderColor: colors.white },
  swatch: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
});
