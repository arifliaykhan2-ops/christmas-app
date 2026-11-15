import { Urbanist_500Medium, Urbanist_600SemiBold, Urbanist_700Bold, Urbanist_800ExtraBold } from '@expo-google-fonts/urbanist';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initPurchases } from '@/lib/premium';
import { SettingsProvider, useSettings } from '@/lib/settings';
import { colors, usesUrbanist } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
initPurchases().catch(() => {});

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, text: colors.white, primary: colors.yellow },
};

function RootStack() {
  const { ready, onboarded } = useSettings();
  const [fontsLoaded] = useFonts(
    usesUrbanist ? { Urbanist_500Medium, Urbanist_600SemiBold, Urbanist_700Bold, Urbanist_800ExtraBold } : {},
  );

  useEffect(() => {
    if (ready && fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [ready, fontsLoaded]);

  if (!ready || !fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ presentation: 'formSheet', sheetGrabberVisible: true, sheetAllowedDetents: [0.8, 1] }} />
        <Stack.Screen name="picker" options={{ presentation: 'modal' }} />
        <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
        <Stack.Screen name="customize" options={{ presentation: 'modal' }} />
        <Stack.Screen name="widget" options={{ presentation: 'modal' }} />
        <Stack.Screen name="door/[day]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="game/[kind]" options={{ presentation: 'fullScreenModal' }} />
      </Stack.Protected>
      <Stack.Screen name="privacy" options={{ presentation: 'modal' }} />
      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <SettingsProvider>
        <StatusBar style="light" />
        <RootStack />
      </SettingsProvider>
    </ThemeProvider>
  );
}
