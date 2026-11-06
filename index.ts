export interface LyricLine {
  id: string;
  text: string;
  start: number | null;
  end: number | null;
}

export type PresetType = 'cinematic' | 'neon' | 'rain' | 'typewriter' | 'retro';

export type BackgroundType = 'rain' | 'bokeh' | 'gradient' | 'image' | 'video';

export type AspectRatioType = '16:9' | '9:16' | '1:1';

export type BengaliFont = 'Hind Siliguri' | 'Noto Serif Bengali' | 'Baloo Da 2' | 'Anek Bangla' | string;

export interface StudioConfig {
  font: BengaliFont;
  fontSize: number; // 18 - 90
  textColor: string;
  glowColor: string;
  preset: PresetType;
  bgType: BackgroundType;
  darkOverlay: number; // 0 - 90 %
  bgBlur: number; // 0 - 25 px
  ratio: AspectRatioType;
  hasIntro: boolean;
  introTitle: string;
  introSubtitle: string;
  hasOutro: boolean;
  outroText: string;
  outroChannel: string;
  kineticEnabled: boolean;
  particlesEnabled: boolean;
  beatPulseEnabled: boolean;
  vignetteEnabled: boolean;
  scanlinesEnabled: boolean;
  songTitle: string;
  artistName: string;
}

export type TranslationMode =
  | 'banglish'
  | 'english'
  | 'romanize'
  | 'bijoy'
  | 'unicodeToBijoy';
