import { StyleSheet, View } from 'react-native';
import { Card, H1, Icon, Scene, Segmented } from '@/components/ui';
import { strings, useI18nVersion } from '@/i18n';
import { useSettings } from '@/lib/settings';

/** First launch: ornament art, a headline and the Continue / Let it snow pill. */
export default function Welcome() {
  useI18nVersion();
  const { finishOnboarding } = useSettings();
  const w = strings.welcome;
  return (
    <Scene scroll={false} contentStyle={st.wrap}>
      <Card inner={st.card}>
        <View style={st.art}>
          <View style={st.leaves}>
            <Icon name="star" size={58} style={{ transform: [{ rotate: '-18deg' }] }} />
            <Icon name="ribbon" size={74} />
            <Icon name="candy" size={64} style={{ transform: [{ rotate: '24deg' }] }} />
          </View>
          <Icon name="bell" size={150} float />
        </View>
        <H1 style={st.title}>{w.title}</H1>
        <Segmented left={w.continue} right={w.snow} onLeft={() => finishOnboarding(false)} onRight={() => finishOnboarding(true)} />
      </Card>
    </Scene>
  );
}

const st = StyleSheet.create({
  wrap: { justifyContent: 'center', paddingBottom: 40 },
  card: { paddingTop: 0, paddingBottom: 22, gap: 26 },
  art: { alignItems: 'center', marginTop: -6 },
  leaves: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: -26, zIndex: 1 },
  title: { textAlign: 'center', fontSize: 30, lineHeight: 36, paddingHorizontal: 6 },
});
