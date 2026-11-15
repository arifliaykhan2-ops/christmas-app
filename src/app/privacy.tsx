import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Accent, Card, Icon, ModalHeader, P, Scene } from '@/components/ui';
import { intlLocale, lang, strings, useI18nVersion } from '@/i18n';
import { PRIVACY, PRIVACY_UPDATED, REVENUECAT_PRIVACY } from '@/i18n/privacy';
import { colors, fonts, weights } from '@/lib/theme';

/** In-app privacy policy, reachable from Settings and the paywall (no website needed). */
export default function PrivacyScreen() {
  useI18nVersion();
  const p = PRIVACY[lang];
  const date = new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'long', year: 'numeric' }).format(PRIVACY_UPDATED);

  return (
    <Scene contentStyle={st.content}>
      <ModalHeader title={p.title} doneLabel={strings.common.done} onDone={() => router.back()} />
      <View style={st.hero}>
        <Icon name="locked" size={72} />
        <View style={{ flex: 1, gap: 4 }}>
          <P style={st.intro}>{p.intro}</P>
          <P muted style={{ fontSize: 13 }}>{`${p.updated}: ${date}`}</P>
        </View>
      </View>
      {p.s.map(([h, body], i) => (
        <Card key={h} inner={{ gap: 6 }}>
          <Accent style={st.h}>{h}</Accent>
          <Text style={st.body}>{body}</Text>
          {i === 3 && (
            <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(REVENUECAT_PRIVACY)}>
              <Text style={st.link}>RevenueCat ↗</Text>
            </Pressable>
          )}
        </Card>
      ))}
    </Scene>
  );
}

const st = StyleSheet.create({
  content: { gap: 14, paddingBottom: 48 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  intro: { fontSize: 16, lineHeight: 22 },
  h: { fontSize: 17 },
  body: { color: colors.white, fontFamily: fonts.body, fontWeight: weights.body, fontSize: 15, lineHeight: 22 },
  link: { color: colors.yellow, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 15, marginTop: 4 },
});
