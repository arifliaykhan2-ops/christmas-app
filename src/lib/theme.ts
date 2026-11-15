import { lang } from '@/i18n';

// Palette taken from the reference: deep pine greens, white type, warm yellow accent.
export const colors = {
  bg: '#0d3a1f',
  bgDeep: '#082a15',
  card: '#2f6b3b',
  cardTop: '#3d8049',
  cardBottom: '#265a31',
  tile: 'rgba(255,255,255,0.07)',
  tileBorder: 'rgba(255,255,255,0.10)',
  line: 'rgba(255,255,255,0.12)',
  white: '#ffffff',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.68)',
  faint: 'rgba(255,255,255,0.45)',
  yellow: '#f5c84c',
  dark: '#0e2416',
  red: '#e2363f',
  danger: '#ff9a8f',
};

export const cardGradient = [colors.cardTop, colors.card, colors.cardBottom] as const;

/** Urbanist covers Latin (incl. Central European); other scripts use the iOS system font. */
const URBANIST: string[] = ['en', 'fr', 'de', 'it', 'es', 'pt', 'nl', 'da', 'sv', 'nb', 'fi', 'pl', 'cs', 'sk', 'hu', 'ro', 'hr', 'ca', 'id', 'ms'];
export const usesUrbanist = URBANIST.includes(lang);

export const fonts = usesUrbanist
  ? { black: 'Urbanist_800ExtraBold', bold: 'Urbanist_700Bold', semi: 'Urbanist_600SemiBold', body: 'Urbanist_500Medium' }
  : { black: undefined, bold: undefined, semi: undefined, body: undefined };

export const weights = usesUrbanist
  ? { black: undefined, bold: undefined, semi: undefined, body: undefined }
  : { black: '800' as const, bold: '700' as const, semi: '600' as const, body: '500' as const };

export const radius = { sm: 14, md: 22, lg: 32, pill: 999 };
