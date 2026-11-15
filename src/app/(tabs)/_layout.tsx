import { NativeTabs } from 'expo-router/native-tabs';
import { strings, useI18nVersion } from '@/i18n';
import { colors, fonts } from '@/lib/theme';

/** System tab bar; SF Symbols, filled when selected. */
export default function TabsLayout() {
  useI18nVersion();
  const t = strings.tabs;
  return (
    <NativeTabs
      tintColor={colors.yellow}
      iconColor="rgba(255,255,255,0.6)"
      labelStyle={{ fontFamily: fonts.semi, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}
      backgroundColor={colors.bgDeep}
      preferredPlacement="tabBar"
    >
      <NativeTabs.Trigger name="index" contentStyle={{ backgroundColor: colors.bg }}>
        <NativeTabs.Trigger.Label>{t.countdown}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'clock', selected: 'clock.fill' }} md="schedule" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="advent" contentStyle={{ backgroundColor: colors.bg }}>
        <NativeTabs.Trigger.Label>{t.advent}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'calendar', selected: 'calendar' }} md="calendar_month" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="santa" contentStyle={{ backgroundColor: colors.bg }}>
        <NativeTabs.Trigger.Label>{t.santa}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'gift', selected: 'gift.fill' }} md="redeem" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="scanner" contentStyle={{ backgroundColor: colors.bg }}>
        <NativeTabs.Trigger.Label>{t.scanner}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'touchid', selected: 'touchid' }} md="fingerprint" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="gifts" contentStyle={{ backgroundColor: colors.bg }}>
        <NativeTabs.Trigger.Label>{t.gifts}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'list.bullet.clipboard', selected: 'list.bullet.clipboard.fill' }} md="checklist" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
