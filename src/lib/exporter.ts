import type { DesignTokens } from '../types';

export function exportAsCSS(tokens: DesignTokens): string {
  return `:root {
  /* Colors */
  --color-primary:   ${tokens.colors.primary};
  --color-secondary: ${tokens.colors.secondary};
  --color-accent:    ${tokens.colors.accent};
  --color-bg:        ${tokens.colors.background};
  --color-text:      ${tokens.colors.text};

  /* Typography */
  --font-heading:    '${tokens.typography.headingFont}', sans-serif;
  --font-body:       '${tokens.typography.bodyFont}', sans-serif;
  --font-size-base:  ${tokens.typography.baseSize};
  --line-height:     ${tokens.typography.lineHeight};

  /* Spacing */
  --spacing-unit:    ${tokens.spacing.unit}px;
${tokens.spacing.scale
  .map((v, i) => `  --spacing-${i}: ${v * tokens.spacing.unit}px;`)
  .join('\n')}
}`;
}

export function exportAsJSON(tokens: DesignTokens): string {
  return JSON.stringify(tokens, null, 2);
}

export function exportAsTailwind(tokens: DesignTokens): string {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary:   '${tokens.colors.primary}',
        secondary: '${tokens.colors.secondary}',
        accent:    '${tokens.colors.accent}',
        background: '${tokens.colors.background}',
        text:      '${tokens.colors.text}',
      },
      fontFamily: {
        heading: ['${tokens.typography.headingFont}', 'sans-serif'],
        body:    ['${tokens.typography.bodyFont}',    'sans-serif'],
      },
      spacing: {
        unit: '${tokens.spacing.unit}px',
${tokens.spacing.scale
  .map((v, i) => `        '${i}': '${v * tokens.spacing.unit}px',`)
  .join('\n')}
      },
    },
  },
};`;
}

export function downloadFile(
  content: string,
  filename: string,
  mime: string
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
