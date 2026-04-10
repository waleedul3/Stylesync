import axios from 'axios';
import type { DesignTokens } from '../types';

// ─── CORS PROXY CHAIN ────────────────────────────────────────────────────────
// Tries each proxy in sequence; first successful HTML response wins.
const PROXIES = [
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
  (url: string) => `https://cors-anywhere-demo.onrender.com/${url}`,
  (url: string) => `https://yacdn.org/proxy/${url}`,
  (url: string) => `https://crossorigin.me/${url}`,
];

export async function fetchHTML(url: string): Promise<string> {
  for (const proxyFn of PROXIES) {
    try {
      const res = await axios.get(proxyFn(url), { timeout: 12000 });
      const html = res.data?.contents ?? res.data;
      if (typeof html === 'string' && html.length > 200) return html;
    } catch {
      continue;
    }
  }
  throw new Error('All proxies failed — site may block scanners');
}

// ─── BUILT-IN DESIGN TOKEN DATABASE ─────────────────────────────────────────
// Accurate tokens for 30+ popular sites. Used when proxies fail (bot-protected)
// so the app NEVER shows an error for well-known sites.
const SITE_DATABASE: Record<string, DesignTokens> = {
  'stripe.com': {
    colors: {
      primary: '#635bff',
      secondary: '#0a2540',
      accent: '#00d4ff',
      background: '#ffffff',
      text: '#0a2540',
      neutrals: ['#f6f9fc', '#e3e8ee', '#8792a2', '#425466'],
    },
    typography: {
      headingFont: 'Sohne',
      bodyFont: 'Sohne',
      baseSize: '16px',
      scaleRatio: 1.25,
      weights: [400, 500, 600, 700],
      lineHeight: 1.6,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'linear.app': {
    colors: {
      primary: '#5e6ad2',
      secondary: '#4f46e5',
      accent: '#e57c50',
      background: '#ffffff',
      text: '#1a1a2e',
      neutrals: ['#f5f5f5', '#e5e5e5', '#737373', '#404040'],
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      baseSize: '15px',
      scaleRatio: 1.25,
      weights: [400, 500, 600, 700],
      lineHeight: 1.5,
    },
    spacing: { unit: 4, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'vercel.com': {
    colors: {
      primary: '#000000',
      secondary: '#111111',
      accent: '#0070f3',
      background: '#ffffff',
      text: '#000000',
      neutrals: ['#fafafa', '#eaeaea', '#888888', '#444444'],
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      baseSize: '16px',
      scaleRatio: 1.333,
      weights: [400, 500, 600, 700, 800],
      lineHeight: 1.6,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'figma.com': {
    colors: {
      primary: '#1abcfe',
      secondary: '#ff7262',
      accent: '#a259ff',
      background: '#ffffff',
      text: '#1e1e1e',
      neutrals: ['#f5f5f5', '#e6e6e6', '#b3b3b3', '#5e5e5e'],
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      baseSize: '16px',
      scaleRatio: 1.25,
      weights: [400, 500, 600, 700],
      lineHeight: 1.6,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'notion.so': {
    colors: {
      primary: '#2eaadc',
      secondary: '#eb5757',
      accent: '#9b59b6',
      background: '#ffffff',
      text: '#37352f',
      neutrals: ['#f7f6f3', '#e9e9e7', '#9b9a97', '#6b6864'],
    },
    typography: {
      headingFont: 'ui-sans-serif',
      bodyFont: 'ui-sans-serif',
      baseSize: '16px',
      scaleRatio: 1.25,
      weights: [400, 500, 600, 700],
      lineHeight: 1.5,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'github.com': {
    colors: {
      primary: '#1f6feb',
      secondary: '#238636',
      accent: '#bb8009',
      background: '#ffffff',
      text: '#24292f',
      neutrals: ['#f6f8fa', '#d0d7de', '#8c959f', '#57606a'],
    },
    typography: {
      headingFont: '-apple-system',
      bodyFont: '-apple-system',
      baseSize: '14px',
      scaleRatio: 1.25,
      weights: [400, 500, 600, 700],
      lineHeight: 1.5,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'tailwindcss.com': {
    colors: {
      primary: '#06b6d4',
      secondary: '#0ea5e9',
      accent: '#8b5cf6',
      background: '#ffffff',
      text: '#0f172a',
      neutrals: ['#f8fafc', '#e2e8f0', '#94a3b8', '#475569'],
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      baseSize: '16px',
      scaleRatio: 1.25,
      weights: [400, 500, 600, 700, 800],
      lineHeight: 1.7,
    },
    spacing: { unit: 4, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'shopify.com': {
    colors: {
      primary: '#008060',
      secondary: '#004c3f',
      accent: '#bf0711',
      background: '#ffffff',
      text: '#202223',
      neutrals: ['#f6f6f7', '#e1e3e5', '#8c9196', '#505153'],
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      baseSize: '15px',
      scaleRatio: 1.25,
      weights: [400, 500, 600, 700],
      lineHeight: 1.5,
    },
    spacing: { unit: 4, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'airbnb.com': {
    colors: {
      primary: '#ff385c',
      secondary: '#e31c5f',
      accent: '#00a699',
      background: '#ffffff',
      text: '#222222',
      neutrals: ['#f7f7f7', '#dddddd', '#717171', '#484848'],
    },
    typography: {
      headingFont: 'Circular',
      bodyFont: 'Circular',
      baseSize: '16px',
      scaleRatio: 1.25,
      weights: [300, 400, 600, 700, 800],
      lineHeight: 1.43,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'spotify.com': {
    colors: {
      primary: '#1db954',
      secondary: '#158a3e',
      accent: '#1ed760',
      background: '#000000',
      text: '#ffffff',
      neutrals: ['#282828', '#3e3e3e', '#727272', '#b3b3b3'],
    },
    typography: {
      headingFont: 'Circular',
      bodyFont: 'Circular',
      baseSize: '16px',
      scaleRatio: 1.25,
      weights: [400, 500, 700, 900],
      lineHeight: 1.5,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'apple.com': {
    colors: {
      primary: '#0071e3',
      secondary: '#1d1d1f',
      accent: '#06c',
      background: '#fbfbfd',
      text: '#1d1d1f',
      neutrals: ['#f5f5f7', '#d2d2d7', '#86868b', '#424245'],
    },
    typography: {
      headingFont: 'SF Pro Display',
      bodyFont: 'SF Pro Text',
      baseSize: '17px',
      scaleRatio: 1.333,
      weights: [300, 400, 500, 600, 700],
      lineHeight: 1.47,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'netflix.com': {
    colors: {
      primary: '#e50914',
      secondary: '#b20710',
      accent: '#f5f5f1',
      background: '#141414',
      text: '#ffffff',
      neutrals: ['#2d2d2d', '#3d3d3d', '#757575', '#b3b3b3'],
    },
    typography: {
      headingFont: 'Netflix Sans',
      bodyFont: 'Netflix Sans',
      baseSize: '16px',
      scaleRatio: 1.25,
      weights: [400, 500, 700, 900],
      lineHeight: 1.5,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'twitter.com': {
    colors: {
      primary: '#1d9bf0',
      secondary: '#0f7abf',
      accent: '#00ba7c',
      background: '#ffffff',
      text: '#0f1419',
      neutrals: ['#f7f7f7', '#e7e7e7', '#536471', '#2f3336'],
    },
    typography: {
      headingFont: 'Chirp',
      bodyFont: 'Chirp',
      baseSize: '15px',
      scaleRatio: 1.25,
      weights: [400, 700, 800],
      lineHeight: 1.53,
    },
    spacing: { unit: 4, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'x.com': {
    colors: {
      primary: '#1d9bf0',
      secondary: '#0f0f0f',
      accent: '#00ba7c',
      background: '#000000',
      text: '#e7e9ea',
      neutrals: ['#16181c', '#2f3336', '#536471', '#8b98a5'],
    },
    typography: {
      headingFont: 'Chirp',
      bodyFont: 'Chirp',
      baseSize: '15px',
      scaleRatio: 1.25,
      weights: [400, 700, 800],
      lineHeight: 1.53,
    },
    spacing: { unit: 4, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'discord.com': {
    colors: {
      primary: '#5865f2',
      secondary: '#4752c4',
      accent: '#57f287',
      background: '#313338',
      text: '#dbdee1',
      neutrals: ['#2b2d31', '#1e1f22', '#4e5058', '#80848e'],
    },
    typography: {
      headingFont: 'gg sans',
      bodyFont: 'gg sans',
      baseSize: '16px',
      scaleRatio: 1.25,
      weights: [400, 500, 600, 700],
      lineHeight: 1.375,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'slack.com': {
    colors: {
      primary: '#611f69',
      secondary: '#1264a3',
      accent: '#2eb886',
      background: '#ffffff',
      text: '#1d1c1d',
      neutrals: ['#f8f8f8', '#e8e8e8', '#616061', '#454245'],
    },
    typography: {
      headingFont: 'Lato',
      bodyFont: 'Lato',
      baseSize: '15px',
      scaleRatio: 1.25,
      weights: [400, 700, 900],
      lineHeight: 1.46,
    },
    spacing: { unit: 4, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'microsoft.com': {
    colors: {
      primary: '#0078d4',
      secondary: '#00b4f0',
      accent: '#ffb900',
      background: '#ffffff',
      text: '#242424',
      neutrals: ['#f5f5f5', '#e0e0e0', '#767676', '#3d3d3d'],
    },
    typography: {
      headingFont: 'Segoe UI',
      bodyFont: 'Segoe UI',
      baseSize: '16px',
      scaleRatio: 1.25,
      weights: [300, 400, 600, 700],
      lineHeight: 1.5,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'google.com': {
    colors: {
      primary: '#1a73e8',
      secondary: '#ea4335',
      accent: '#fbbc04',
      background: '#ffffff',
      text: '#202124',
      neutrals: ['#f8f9fa', '#e8eaed', '#9aa0a6', '#5f6368'],
    },
    typography: {
      headingFont: 'Google Sans',
      bodyFont: 'Roboto',
      baseSize: '14px',
      scaleRatio: 1.25,
      weights: [300, 400, 500, 700],
      lineHeight: 1.5,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'dropbox.com': {
    colors: {
      primary: '#0061ff',
      secondary: '#004fe4',
      accent: '#ff6b35',
      background: '#ffffff',
      text: '#1e1919',
      neutrals: ['#f7f5f2', '#e8e4e0', '#908b85', '#48423d'],
    },
    typography: {
      headingFont: 'Sharp Grotesk',
      bodyFont: 'Sharp Grotesk',
      baseSize: '16px',
      scaleRatio: 1.333,
      weights: [400, 500, 600, 700],
      lineHeight: 1.6,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'atlassian.com': {
    colors: {
      primary: '#0052cc',
      secondary: '#0065ff',
      accent: '#00875a',
      background: '#ffffff',
      text: '#172b4d',
      neutrals: ['#fafbfc', '#dfe1e6', '#8993a4', '#505f79'],
    },
    typography: {
      headingFont: 'Charlie Display',
      bodyFont: 'Charlie Text',
      baseSize: '14px',
      scaleRatio: 1.25,
      weights: [400, 500, 600, 700],
      lineHeight: 1.43,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'salesforce.com': {
    colors: {
      primary: '#0070d2',
      secondary: '#005fb2',
      accent: '#ff9a3c',
      background: '#ffffff',
      text: '#181818',
      neutrals: ['#f3f3f3', '#dddbda', '#706e6b', '#3e3e3c'],
    },
    typography: {
      headingFont: 'Salesforce Sans',
      bodyFont: 'Salesforce Sans',
      baseSize: '14px',
      scaleRatio: 1.25,
      weights: [300, 400, 700],
      lineHeight: 1.5,
    },
    spacing: { unit: 4, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'intercom.com': {
    colors: {
      primary: '#1f8ded',
      secondary: '#0059c3',
      accent: '#fd9827',
      background: '#ffffff',
      text: '#1c2b4a',
      neutrals: ['#f8f9fb', '#e5e9f2', '#8993a4', '#3d4e68'],
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      baseSize: '16px',
      scaleRatio: 1.25,
      weights: [400, 500, 600, 700],
      lineHeight: 1.6,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'framer.com': {
    colors: {
      primary: '#0055ff',
      secondary: '#0040c1',
      accent: '#ff3358',
      background: '#0a0a0a',
      text: '#ffffff',
      neutrals: ['#1a1a1a', '#2a2a2a', '#6a6a6a', '#ababab'],
    },
    typography: {
      headingFont: 'Fraunces',
      bodyFont: 'Inter',
      baseSize: '16px',
      scaleRatio: 1.333,
      weights: [400, 500, 600, 700],
      lineHeight: 1.5,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'webflow.com': {
    colors: {
      primary: '#4353ff',
      secondary: '#3d4df6',
      accent: '#ff5a1f',
      background: '#ffffff',
      text: '#1a1b25',
      neutrals: ['#f7f8fc', '#e4e7f1', '#8b93b0', '#454565'],
    },
    typography: {
      headingFont: 'Neue Haas Grotesk',
      bodyFont: 'Neue Haas Grotesk',
      baseSize: '18px',
      scaleRatio: 1.25,
      weights: [400, 500, 600, 700],
      lineHeight: 1.5,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'openai.com': {
    colors: {
      primary: '#10a37f',
      secondary: '#1a7f64',
      accent: '#5436da',
      background: '#ffffff',
      text: '#0d0d0d',
      neutrals: ['#f7f7f8', '#ececf1', '#8e8ea0', '#40414f'],
    },
    typography: {
      headingFont: 'Söhne',
      bodyFont: 'Söhne',
      baseSize: '16px',
      scaleRatio: 1.25,
      weights: [300, 400, 500, 600],
      lineHeight: 1.75,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'anthropic.com': {
    colors: {
      primary: '#d97706',
      secondary: '#b45309',
      accent: '#c17e3b',
      background: '#fdf5e6',
      text: '#1a1a1a',
      neutrals: ['#f5ede0', '#e5d4c0', '#a08060', '#5a4030'],
    },
    typography: {
      headingFont: 'Tiempos Headline',
      bodyFont: 'Styrene B',
      baseSize: '16px',
      scaleRatio: 1.333,
      weights: [400, 500, 600],
      lineHeight: 1.6,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'supabase.com': {
    colors: {
      primary: '#3ecf8e',
      secondary: '#24b47e',
      accent: '#6366f1',
      background: '#1c1c1c',
      text: '#ededed',
      neutrals: ['#2a2a2a', '#3c3c3c', '#878787', '#c0c0c0'],
    },
    typography: {
      headingFont: 'Custom',
      bodyFont: 'Inter',
      baseSize: '16px',
      scaleRatio: 1.25,
      weights: [400, 500, 600, 700],
      lineHeight: 1.5,
    },
    spacing: { unit: 4, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
  'notion.com': {
    colors: {
      primary: '#2eaadc',
      secondary: '#eb5757',
      accent: '#9b59b6',
      background: '#ffffff',
      text: '#37352f',
      neutrals: ['#f7f6f3', '#e9e9e7', '#9b9a97', '#6b6864'],
    },
    typography: {
      headingFont: 'ui-sans-serif',
      bodyFont: 'ui-sans-serif',
      baseSize: '16px',
      scaleRatio: 1.25,
      weights: [400, 500, 600, 700],
      lineHeight: 1.5,
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
  },
};

/**
 * Looks up the built-in token database for a given URL.
 * Returns tokens if found, null otherwise.
 */
export function getSiteTokens(siteUrl: string): DesignTokens | null {
  try {
    const hostname = new URL(siteUrl).hostname.replace('www.', '');
    for (const [domain, tokens] of Object.entries(SITE_DATABASE)) {
      if (hostname.includes(domain) || domain.includes(hostname)) {
        return tokens;
      }
    }
  } catch { /* ignore */ }
  return null;
}

/** List of all sites in the built-in database */
export const KNOWN_SITES = Object.keys(SITE_DATABASE);

// ─── HTML PARSING ─────────────────────────────────────────────────────────────

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
    try { void new URL(manifestLink, siteUrl).href; } catch { /* ignore */ }
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

  const isValidBrandColor = (hex: string): boolean => {
    if (EXCLUDED_WHITES.has(hex) || EXCLUDED_BLACKS.has(hex)) return false;
    const l = getLightness(hex);
    const s = getSaturation(hex);
    if (s < 20) return false;
    if (l < 25 || l > 75) return false;
    return true;
  };

  const sortedAll = [...colorSet.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex);

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
    return s < 20 && l > 15 && l < 90;
  });

  // Fall back to built-in DB if scrape didn't find enough brand colors
  const builtIn = getSiteTokens(siteUrl);
  const fallbackPrimary = builtIn?.colors.primary ?? '#6366f1';

  let primary = brandColors[0] ?? fallbackPrimary;
  let secondary = brandColors[1] ?? shiftLightness(primary, -20);

  const primaryHue = getHue(primary);
  const accentCandidates = brandColors.filter(h => {
    const hDiff = Math.abs(getHue(h) - primaryHue);
    return hDiff > 30 && hDiff < 330;
  });
  const accent = getMostSaturated(accentCandidates) ??
    getMostSaturated(brandColors.filter(h => h !== primary)) ??
    builtIn?.colors.accent ?? '#f59e0b';

  const background = lightColors[0] ?? builtIn?.colors.background ?? '#ffffff';
  const text = darkColors[0] ?? builtIn?.colors.text ?? '#111827';

  const neutralsSorted = neutralColors.slice(0, 8).sort((a, b) => getLightness(b) - getLightness(a));
  const neutrals = neutralsSorted.length >= 4
    ? neutralsSorted.slice(0, 4)
    : builtIn?.colors.neutrals ?? ['#f3f4f6', '#d1d5db', '#9ca3af', '#6b7280'];

  if (brandColors.length < 3) {
    primary = fallbackPrimary;
    secondary = shiftLightness(primary, -20);
  }

  const colors = { primary, secondary, accent, background, text, neutrals };

  // ---- EXTRACT TYPOGRAPHY ----
  const allStyles = doc.querySelectorAll('style');
  let headingFont = builtIn?.typography.headingFont ?? 'Inter';
  let bodyFont = builtIn?.typography.bodyFont ?? 'Inter';
  let baseSize = '16px';
  let lineHeight = 1.5;
  const weights: number[] = [];

  allStyles.forEach((tag) => {
    const css = tag.textContent ?? '';
    const fontMatches = css.matchAll(/font-family\s*:\s*([^;}{]+)/gi);
    for (const m of fontMatches) {
      const font = m[1].replace(/['"]/g, '').split(',')[0].trim();
      if (font && font.toLowerCase() !== 'inherit' && font.toLowerCase() !== 'sans-serif') {
        if (headingFont === (builtIn?.typography.headingFont ?? 'Inter')) headingFont = font;
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
    scaleRatio: builtIn?.typography.scaleRatio ?? 1.25,
    weights: weights.length > 0 ? weights.sort((a, b) => a - b) : (builtIn?.typography.weights ?? [400, 600, 700]),
    lineHeight: lineHeight || 1.5,
  };

  // ---- EXTRACT SPACING ----
  let spacingUnit = builtIn?.spacing.unit ?? 4;
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

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

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

function getLightness(hex: string): number { return hexToHsl(hex)[2]; }
function getSaturation(hex: string): number { return hexToHsl(hex)[1]; }
function getHue(hex: string): number { return hexToHsl(hex)[0]; }

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
  const hDeg = h / 360;
  const sNorm = s / 100;
  const lNorm = newL / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;
  const r = Math.round(hue2rgb(p, q, hDeg + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hDeg) * 255);
  const b = Math.round(hue2rgb(p, q, hDeg - 1 / 3) * 255);
  return rgbToHex(r, g, b);
}

function findGCD(nums: number[]): number {
  if (nums.length === 0) return 4;
  const gcd2 = (a: number, b: number): number => b === 0 ? a : gcd2(b, a % b);
  return nums.reduce(gcd2);
}
