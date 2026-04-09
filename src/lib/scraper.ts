import axios from 'axios';
import type { DesignTokens } from '../types';

// CORS proxy fallback chain
const PROXIES = [
  (url: string) =>
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) =>
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) =>
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

export async function fetchHTML(url: string): Promise<string> {
  for (const proxyFn of PROXIES) {
    try {
      const res = await axios.get(proxyFn(url), { timeout: 15000 });
      const html = res.data?.contents ?? res.data;
      if (typeof html === 'string' && html.length > 100) return html;
    } catch {
      continue;
    }
  }
  throw new Error('All proxies failed — site may block scanners');
}

// Per-domain fallback primary colors
const DOMAIN_FALLBACKS: Record<string, string> = {
  'stripe.com': '#635bff',
  'airbnb.com': '#ff385c',
  'github.com': '#1f6feb',
  'shopify.com': '#96bf48',
  'vercel.com': '#000000',
  'linear.app': '#5e6ad2',
  'figma.com': '#1abcfe',
  'notion.so': '#000000',
  'tailwindcss.com': '#06b6d4',
};

function getDomainFallback(siteUrl: string): string {
  try {
    const hostname = new URL(siteUrl).hostname.replace('www.', '');
    for (const [domain, color] of Object.entries(DOMAIN_FALLBACKS)) {
      if (hostname.includes(domain)) return color;
    }
  } catch { /* ignore */ }
  return '#6366f1';
}

export function parseDesignTokens(html: string, siteUrl: string): DesignTokens {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // ---- EXTRACT COLORS ----
  const colorSet = new Map<string, number>();

  function countColor(value: string, weight = 1) {
    const hex = toHex(value);
    if (hex) colorSet.set(hex, (colorSet.get(hex) ?? 0) + weight);
  }

  // HIGHEST PRIORITY: meta theme-color
  const themeColor = doc.querySelector('meta[name="theme-color"]')?.getAttribute('content');
  if (themeColor) countColor(themeColor, 200);

  // HIGH PRIORITY: manifest.json theme_color (try to fetch)
  const manifestLink = doc.querySelector('link[rel="manifest"]')?.getAttribute('href');
  if (manifestLink) {
    try {
      // Note: manifest would ideally be fetched server-side to extract theme_color
      // This is a placeholder for future server-side implementation
      void new URL(manifestLink, siteUrl).href;
    } catch { /* ignore */ }
  }

  // MEDIUM-HIGH PRIORITY: CSS variables in :root or body
  const cssVarPatterns = [
    /--(?:color-)?primary\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/gi,
    /--(?:color-)?brand(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/gi,
    /--accent(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/gi,
    /--(?:color-)?secondary\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/gi,
  ];
  doc.querySelectorAll('style').forEach((tag) => {
    const css = tag.textContent ?? '';
    for (const pattern of cssVarPatterns) {
      const matches = css.matchAll(pattern);
      for (const m of matches) countColor(m[1], 80);
    }
  });

  // HIGH PRIORITY: SVG fill attributes (logos often brand colors)
  doc.querySelectorAll('svg [fill]').forEach((el) => {
    const fill = el.getAttribute('fill') ?? '';
    if (fill !== 'none' && fill !== 'currentColor') countColor(fill, 60);
  });

  // MEDIUM PRIORITY: data-color attributes
  doc.querySelectorAll('[data-color]').forEach((el) => {
    countColor(el.getAttribute('data-color') ?? '', 40);
  });

  // MEDIUM PRIORITY: From inline styles on all elements
  doc.querySelectorAll('[style]').forEach((el) => {
    extractCSSColors(el.getAttribute('style') ?? '').forEach(c => countColor(c, 2));
  });

  // LOW-MEDIUM PRIORITY: From <style> tags (standard weight)
  doc.querySelectorAll('style').forEach((tag) => {
    extractCSSColors(tag.textContent ?? '').forEach(c => countColor(c, 1));
  });

  // ---- BUILD PALETTE WITH IMPROVED RANKING ----
  const EXCLUDED_WHITES = new Set(['#ffffff', '#fff', '#fafafa', '#f9f9f9', '#f5f5f5', '#f8f8f8']);
  const EXCLUDED_BLACKS = new Set(['#000000', '#000', '#111111', '#111', '#1a1a1a', '#0f0f0f']);

  // VALIDATE BRAND COLOR: saturation > 20%, lightness 25-75%, not neutral gray
  const isValidBrandColor = (hex: string): boolean => {
    if (EXCLUDED_WHITES.has(hex) || EXCLUDED_BLACKS.has(hex)) return false;
    const l = getLightness(hex);
    const s = getSaturation(hex);
    // Must have saturation > 20% to be a brand color
    if (s < 20) return false;
    // Must have lightness between 25% and 75%
    if (l < 25 || l > 75) return false;
    return true;
  };

  // Sort all colors by frequency descending
  const sortedAll = [...colorSet.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex);

  // Separate into categories
  const brandColors = sortedAll.filter(isValidBrandColor);
  const lightColors = sortedAll.filter(h => {
    const l = getLightness(h);
    return l > 90 && !EXCLUDED_WHITES.has(h);
  });
  const darkColors = sortedAll.filter(h => {
    const l = getLightness(h);
    return l < 20 && !EXCLUDED_BLACKS.has(h);
  });
  const neutralColors = sortedAll.filter(h => {
    const s = getSaturation(h);
    const l = getLightness(h);
    // Neutrals: saturation < 20%, lightness between 15-90%
    return s < 20 && l > 15 && l < 90;
  });

  // PRIMARY: most frequent brand color, fallback to domain default
  let primary = brandColors[0] ?? getDomainFallback(siteUrl);

  // SECONDARY: second most frequent brand color, or darker shade of primary
  let secondary = brandColors[1] ?? shiftLightness(primary, -20);

  // ACCENT: highest saturation color with different hue (>30°) from primary
  const primaryHue = getHue(primary);
  const accentCandidates = brandColors.filter(h => {
    const hDiff = Math.abs(getHue(h) - primaryHue);
    return hDiff > 30 && hDiff < 330; // Different hue
  });
  const accent = getMostSaturated(accentCandidates) ??
    getMostSaturated(brandColors.filter(h => h !== primary)) ??
    '#f59e0b'; // Amber fallback

  // BACKGROUND: most frequent very light color, default white
  const background = lightColors[0] ?? '#ffffff';

  // TEXT: most frequent very dark color, default near-black
  const text = darkColors[0] ?? '#111827';

  // NEUTRALS: 4 colors with saturation < 20%, sorted light to dark
  const neutralsSorted = neutralColors
    .slice(0, 8)
    .sort((a, b) => getLightness(b) - getLightness(a));
  const neutrals = neutralsSorted.length >= 4
    ? neutralsSorted.slice(0, 4)
    : ['#f3f4f6', '#d1d5db', '#9ca3af', '#6b7280']; // Light to dark

  // Use domain fallback if fewer than 3 non-neutral colors found
  if (brandColors.length < 3) {
    primary = getDomainFallback(siteUrl);
    secondary = shiftLightness(primary, -20);
  }

  const colors = { primary, secondary, accent, background, text, neutrals };

  // ---- EXTRACT TYPOGRAPHY ----
  const allStyles = doc.querySelectorAll('style');
  let headingFont = 'Inter';
  let bodyFont = 'Inter';
  let baseSize = '16px';
  let lineHeight = 1.5;
  const weights: number[] = [];

  allStyles.forEach((tag) => {
    const css = tag.textContent ?? '';
    const fontMatches = css.matchAll(/font-family\s*:\s*([^;}{]+)/gi);
    for (const m of fontMatches) {
      const font = m[1].replace(/['"]/g, '').split(',')[0].trim();
      if (font && font.toLowerCase() !== 'inherit' && font.toLowerCase() !== 'sans-serif') {
        if (headingFont === 'Inter') headingFont = font;
        bodyFont = font;
      }
    }
    const sizeMatch = css.match(/body[^{]*\{[^}]*font-size\s*:\s*([\d.]+(?:px|rem|em))/i);
    if (sizeMatch) baseSize = sizeMatch[1];
    const weightMatches = css.matchAll(/font-weight\s*:\s*(\d{3})/g);
    for (const m of weightMatches) {
      const w = parseInt(m[1]);
      if (!weights.includes(w)) weights.push(w);
    }
    const lhMatch = css.match(/line-height\s*:\s*([\d.]+)/);
    if (lhMatch) lineHeight = parseFloat(lhMatch[1]);
  });

  // Check Google Fonts links
  const ogFont = doc
    .querySelector('link[rel="stylesheet"][href*="fonts.googleapis"]')
    ?.getAttribute('href');
  if (ogFont) {
    const fontName = ogFont.match(/family=([^:&+]+)/)?.[1]?.replace(/\+/g, ' ');
    if (fontName) { headingFont = fontName; bodyFont = fontName; }
  }

  const typography = {
    headingFont: headingFont || 'Inter',
    bodyFont: bodyFont || 'Inter',
    baseSize: baseSize || '16px',
    scaleRatio: 1.25,
    weights: weights.length > 0 ? weights.sort((a, b) => a - b) : [400, 600, 700],
    lineHeight: lineHeight || 1.5,
  };

  // ---- EXTRACT SPACING ----
  let spacingUnit = 4;
  const allStyleText = [...allStyles].map((s) => s.textContent).join(' ');
  const spacingMatches = allStyleText.matchAll(/(?:padding|margin)\s*:\s*([\d.]+)px/g);
  const spacingVals: number[] = [];
  for (const m of spacingMatches) {
    const v = parseFloat(m[1]);
    if (v > 0 && v < 200) spacingVals.push(v);
  }
  if (spacingVals.length > 0) {
    const gcd = findGCD(spacingVals.map(Math.round).filter((v) => v > 0));
    spacingUnit = Math.max(4, Math.min(gcd, 16));
  }

  return { colors, typography, spacing: { unit: spacingUnit, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] } };
}

// ---- HELPER FUNCTIONS ----

function extractCSSColors(css: string): string[] {
  const results: string[] = [];
  const hexMatches = css.matchAll(/#([0-9a-fA-F]{3,6})\b/g);
  for (const m of hexMatches) results.push('#' + m[1]);
  const rgbMatches = css.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g);
  for (const m of rgbMatches) results.push(rgbToHex(+m[1], +m[2], +m[3]));
  return results;
}

function toHex(value: string): string | null {
  value = value.trim();
  if (/^#[0-9a-fA-F]{3,6}$/.test(value)) {
    if (value.length === 4) {
      return '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
    }
    return value.toLowerCase();
  }
  const rgb = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgb) return rgbToHex(+rgb[1], +rgb[2], +rgb[3]);
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.min(255, v).toString(16).padStart(2, '0')).join('');
}

function hexToHsl(hex: string): [number, number, number] {
  if (hex.length < 7) return [0, 0, 50];
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

function getLightness(hex: string): number {
  return hexToHsl(hex)[2];
}

function getSaturation(hex: string): number {
  return hexToHsl(hex)[1];
}

function getHue(hex: string): number {
  return hexToHsl(hex)[0];
}

function getMostSaturated(hexColors: string[]): string | null {
  let best: string | null = null;
  let bestSat = 0;
  for (const hex of hexColors) {
    const sat = getSaturation(hex);
    if (sat > bestSat) { bestSat = sat; best = hex; }
  }
  return best;
}

function shiftLightness(hex: string, delta: number): string {
  const [h, s, l] = hexToHsl(hex);
  const newL = Math.max(10, Math.min(90, l + delta));
  // Convert HSL back to hex
  const hDeg = h / 360;
  const sNorm = s / 100;
  const lNorm = newL / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;
  const r = Math.round(hue2rgb(p, q, hDeg + 1/3) * 255);
  const g = Math.round(hue2rgb(p, q, hDeg) * 255);
  const b = Math.round(hue2rgb(p, q, hDeg - 1/3) * 255);
  return rgbToHex(r, g, b);
}

function findGCD(nums: number[]): number {
  if (nums.length === 0) return 4;
  const gcd2 = (a: number, b: number): number => b === 0 ? a : gcd2(b, a % b);
  return nums.reduce(gcd2);
}
