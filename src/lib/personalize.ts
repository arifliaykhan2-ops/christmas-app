import { File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

/** Countdown card + widget colour themes. "pine" is free; the rest are Premium. */
export const THEMES = {
  pine: { colors: ['#3d8049', '#2f6b3b', '#265a31'], top: '#3d8049', bottom: '#1f4d2a' },
  velvet: { colors: ['#c8424b', '#9b1c27', '#6d1118'], top: '#c8424b', bottom: '#5c0e16' },
  night: { colors: ['#3a5da3', '#1d3566', '#101f40'], top: '#3a5da3', bottom: '#0d1a36' },
  gold: { colors: ['#d4ad55', '#a37f2e', '#6b5218'], top: '#d4ad55', bottom: '#5a4413' },
  candy: { colors: ['#ef6f80', '#c83c55', '#8a1f38'], top: '#ef6f80', bottom: '#7a1a31' },
  ginger: { colors: ['#c08454', '#8c5530', '#5e3720'], top: '#c08454', bottom: '#4f2e1a' },
} as const;

export type ThemeId = keyof typeof THEMES;
export const THEME_IDS = Object.keys(THEMES) as ThemeId[];
export const FREE_THEME: ThemeId = 'pine';

export type PickedPhoto = { uri: string; widgetBase64: string };

/**
 * Lets the user pick a photo, keeps a 1080px copy in the app's documents folder
 * (survives restarts) and a small JPEG for the widget (shared through the App Group).
 * Returns null when the user cancels.
 */
export async function pickPhoto(previous?: string | null): Promise<PickedPhoto | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 1 });
  if (res.canceled || !res.assets?.[0]) return null;
  const source = res.assets[0].uri;

  const big = await (await ImageManipulator.manipulate(source).resize({ width: 1080 }).renderAsync()).saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.85,
  });
  const small = await (await ImageManipulator.manipulate(source).resize({ width: 480 }).renderAsync()).saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.6,
    base64: true,
  });

  const target = new File(Paths.document, `countdown-photo-${Date.now()}.jpg`);
  await new File(big.uri).copy(target);
  if (previous) removePhoto(previous);
  return { uri: target.uri, widgetBase64: small.base64 ?? '' };
}

export function removePhoto(uri: string) {
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {}
}
