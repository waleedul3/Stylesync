import type { DesignTokens } from '../types';

export function applyTokensToDOM(tokens: DesignTokens) {
  const r = document.documentElement;
  r.style.setProperty('--color-primary', tokens.colors.primary);
  r.style.setProperty('--color-secondary', tokens.colors.secondary);
  r.style.setProperty('--color-accent', tokens.colors.accent);
  r.style.setProperty('--color-bg', tokens.colors.background);
  r.style.setProperty('--color-text', tokens.colors.text);
  r.style.setProperty(
    '--font-heading',
    `'${tokens.typography.headingFont}', sans-serif`
  );
  r.style.setProperty(
    '--font-body',
    `'${tokens.typography.bodyFont}', sans-serif`
  );
  r.style.setProperty('--font-size-base', tokens.typography.baseSize);
  r.style.setProperty('--line-height', String(tokens.typography.lineHeight));
  r.style.setProperty('--spacing-unit', tokens.spacing.unit + 'px');
  tokens.spacing.scale.forEach((v, i) =>
    r.style.setProperty(`--spacing-${i}`, v * tokens.spacing.unit + 'px')
  );
}
