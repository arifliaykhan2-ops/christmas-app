import { router } from 'expo-router';

/**
 * Close a modal. When it has nothing to go back to (opened from the widget link,
 * or pushed while the onboarding screen was being replaced) go to the countdown
 * instead of silently doing nothing.
 */
export function closeModal() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
