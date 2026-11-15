import type { Icon3D } from './assets';

export type DoorKind = 'idea' | 'fact' | 'game' | 'eve';
export type GameKind = 'catch' | 'memory' | 'catch-fast';

/** Day 1–24 → what is behind the door. Texts live in i18n (advent.items). */
export const DOORS: { kind: DoorKind; icon: Icon3D; game?: GameKind }[] = [
  { kind: 'idea', icon: 'snowflake' },
  { kind: 'fact', icon: 'letter' },
  { kind: 'idea', icon: 'music' },
  { kind: 'fact', icon: 'tree' },
  { kind: 'idea', icon: 'loveLetter' },
  { kind: 'fact', icon: 'candy' },
  { kind: 'game', icon: 'snowman', game: 'catch' },
  { kind: 'idea', icon: 'cookie' },
  { kind: 'fact', icon: 'star' },
  { kind: 'idea', icon: 'glowingStar' },
  { kind: 'fact', icon: 'bell' },
  { kind: 'idea', icon: 'cocoa' },
  { kind: 'fact', icon: 'candle' },
  { kind: 'game', icon: 'gift', game: 'memory' },
  { kind: 'idea', icon: 'house' },
  { kind: 'fact', icon: 'lollipop' },
  { kind: 'idea', icon: 'gloves' },
  { kind: 'fact', icon: 'partyPopper' },
  { kind: 'idea', icon: 'ribbon' },
  { kind: 'fact', icon: 'music' },
  { kind: 'game', icon: 'deer', game: 'catch-fast' },
  { kind: 'idea', icon: 'night' },
  { kind: 'fact', icon: 'fire' },
  { kind: 'eve', icon: 'santa' },
];
