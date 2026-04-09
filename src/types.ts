export interface ColorTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  neutrals: string[];
}

export interface TypographyTokens {
  headingFont: string;
  bodyFont: string;
  baseSize: string;
  scaleRatio: number;
  weights: number[];
  lineHeight: number;
}

export interface SpacingTokens {
  unit: number;
  scale: number[];
}

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
}

export interface ScrapeError {
  type: 'bot_protected' | 'timeout' | 'invalid_url' | 'network_error';
  message: string;
}

export interface VersionEntry {
  id: string;
  sessionId: string;
  tokenPath: string;
  previousValue: string | null;
  newValue: string;
  changedAt: any;
  changeType: 'scraped' | 'user_edit' | 'locked' | 'unlocked';
}
