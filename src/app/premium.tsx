import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Accent, Button, Card, H1, Icon, ModalHeader, P, Scene, TextButton } from '@/components/ui';
import { fmt, strings, useI18nVersion } from '@/i18n';
import { IS_EXPO_GO, TERMS_URL, clearTestPurchase, loadOffer, manageSubscription, restore, subscribe, usePremium, type Offer } from '@/lib/premium';
import type { Icon3D } from '@/lib/assets';
import { useSettings } from '@/lib/settings';
import { colors, fonts, radius, weights } from '@/lib/theme';

/** Paywall: 7-day free trial, then the monthly price — all prices come from the App Store. */
export default function PremiumScreen() {
  useI18nVersion();
  const s = strings.premium;
  const premium = usePremium();
  const { previewPhoto } = useSettings();
  const [offer, setOffer] = useState<Offer | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadOffer().then(setOffer, () => setOffer(null));
  }, []);

  async function start() {
    setBusy(true);
    try {
      if (await subscribe()) router.back();
    } catch {
      Alert.alert(s.title, offer === null ? s.unavailable : s.error);
    } finally {
      setBusy(false);
    }
  }

  async function doRestore() {
    setBusy(true);
    try {
      Alert.alert(s.title, (await restore()) ? s.restored : s.nothing);
    } catch {
      Alert.alert(s.title, s.error);
    } finally {
      setBusy(false);
    }
  }

  const benefits: [Icon3D, string][] = [
    ['house', s.photo],
    ['sparkles', s.themes],
    ['letter', s.watermark],
  ];

  const priceLine = offer ? (offer.trialDays ? fmt(s.trial, { days: offer.trialDays, price: offer.price }) : fmt(s.noTrial, { price: offer.price })) : '';

  return (
    <Scene contentStyle={{ paddingTop: 30 }}>
      <ModalHeader doneLabel={strings.common.close} onDone={() => router.back()} />
      {previewPhoto ? (
        // The photo they just tried: what they keep by subscribing.
        <View style={st.art}>
          <Icon name="gift" size={70} style={{ transform: [{ rotate: '-12deg' }] }} />
          <Image source={{ uri: previewPhoto }} style={st.photo} contentFit="cover" />
          <Icon name="star" size={60} style={{ transform: [{ rotate: '14deg' }] }} />
        </View>
      ) : (
        <View style={st.art}>
          <Icon name="gift" size={86} style={{ transform: [{ rotate: '-12deg' }] }} />
          <Icon name="santa" size={140} float />
          <Icon name="star" size={70} style={{ transform: [{ rotate: '14deg' }] }} />
        </View>
      )}

      <View style={{ alignItems: 'center', gap: 6 }}>
        <H1 style={{ textAlign: 'center', fontSize: 34 }}>{s.title}</H1>
        <Accent style={{ textAlign: 'center' }}>{premium.active ? s.active : s.subtitle}</Accent>
      </View>

      <Card inner={{ gap: 12 }}>
        {benefits.map(([icon, text]) => (
          <View key={text} style={st.benefit}>
            <View style={st.benefitIcon}>
              <Icon name={icon} size={34} />
            </View>
            <Text style={st.benefitText}>{text}</Text>
          </View>
        ))}
      </Card>

      {premium.active ? (
        <>
          <Button title={s.personalize} chevrons onPress={() => router.replace('/customize')} />
          {!premium.test && <TextButton title={s.manage} onPress={() => manageSubscription().catch(() => {})} />}
          {premium.test && IS_EXPO_GO && <TextButton title="Reset test purchase (Expo Go)" onPress={clearTestPurchase} />}
        </>
      ) : (
        <>
          {offer === undefined ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              {!!priceLine && <P center style={st.price}>{priceLine}</P>}
              <Button title={offer?.trialDays ? s.start : s.subscribe} chevrons disabled={busy || !offer} onPress={start} />
              {!offer && <P muted center style={{ fontSize: 13 }}>{s.unavailable}</P>}
            </>
          )}
          <TextButton title={s.restore} onPress={doRestore} />
        </>
      )}

      <P muted center style={st.legal}>{s.legal}</P>
      <View style={st.links}>
        <Pressable onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)}>
          <Text style={st.link}>{s.terms}</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/privacy')}>
          <Text style={st.link}>{s.privacy}</Text>
        </Pressable>
      </View>
      {IS_EXPO_GO && <P muted center style={{ fontSize: 11 }}>Expo Go: test mode, no real payment.</P>}
    </Scene>
  );
}

const st = StyleSheet.create({
  photo: { width: 150, height: 188, borderRadius: radius.md, borderWidth: 3, borderColor: colors.yellow },
  art: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  benefitIcon: { width: 52, height: 52, borderRadius: radius.sm, backgroundColor: 'rgba(8,42,21,0.45)', alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, color: colors.white, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 16, lineHeight: 21 },
  price: { fontFamily: fonts.bold, fontWeight: weights.bold, fontSize: 17 },
  legal: { fontSize: 11, lineHeight: 15 },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 22 },
  link: { color: colors.white, fontFamily: fonts.semi, fontWeight: weights.semi, fontSize: 13, textDecorationLine: 'underline' },
});
