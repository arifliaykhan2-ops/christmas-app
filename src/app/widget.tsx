import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { WidgetPreview } from '@/components/WidgetPreview';
import { Button, Card, ModalHeader, P, Scene } from '@/components/ui';
import { strings, useI18nVersion } from '@/i18n';
import { usePremium } from '@/lib/premium';
import { colors, fonts, weights } from '@/lib/theme';

/** How to add the Home/Lock Screen widget: iOS doesn't let apps add widgets themselves. */
export default function WidgetGuideScreen() {
  useI18nVersion();
  const w = strings.widget;
  const premium = usePremium().active;

  return (
    <Scene contentStyle={{ gap: 16, paddingBottom: 48 }}>
      <ModalHeader title={w.title} doneLabel={strings.common.done} onDone={() => router.back()} />
      <View style={st.previews}>
        <WidgetPreview size="medium" width={150} />
        <WidgetPreview size="small" width={150} />
      </View>

      {!premium && (
        <Button title={`✨ ${strings.premium.addPhoto}`} chevrons onPress={() => router.push('/premium')} />
      )}

      <Card inner={{ gap: 14 }}>
        {w.steps.map((step, i) => (
          <View key={step} style={st.step}>
            <View style={st.num}>
              <Text style={st.numText}>{i + 1}</Text>
            </View>
            <P style={{ flex: 1, fontSize: 15 }}>{step}</P>
          </View>
        ))}
      </Card>
      <Card>
        <P style={{ fontSize: 14 }}>🔒 {w.lock}</P>
      </Card>
    </Scene>
  );
}

const st = StyleSheet.create({
  previews: { alignItems: 'center', gap: 16 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  num: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' },
  numText: { color: colors.dark, fontFamily: fonts.black, fontWeight: weights.black, fontSize: 15 },
});
