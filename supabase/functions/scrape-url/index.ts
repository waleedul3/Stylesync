import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url, sessionId } = await req.json();

    if (!url || !sessionId) {
      return new Response(
        JSON.stringify({ error: "url and sessionId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try { parsedUrl = new URL(url); }
    catch {
      return new Response(
        JSON.stringify({ errorType: "invalid_url", message: "Invalid URL format" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Init Supabase client (service role — can bypass RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create scraped_site record
    const { data: siteData, error: siteError } = await supabase
      .from("scraped_sites")
      .insert({ url, extraction_status: "pending" })
      .select()
      .single();

    if (siteError) throw siteError;
    const siteId = siteData.id;

    // Fetch the URL with browser-like headers
    let html: string;
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        const errType = response.status === 403 || response.status === 429
          ? "bot_protected" : "network_error";
        await supabase.from("scraped_sites")
          .update({ extraction_status: "failed", error_message: `HTTP ${response.status}` })
          .eq("id", siteId);
        return new Response(
          JSON.stringify({ errorType: errType, message: `Site returned ${response.status}` }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      html = await response.text();
    } catch (fetchErr: any) {
      const errType = fetchErr.name === "TimeoutError" ? "timeout" : "network_error";
      await supabase.from("scraped_sites")
        .update({ extraction_status: "failed", error_message: fetchErr.message })
        .eq("id", siteId);
      return new Response(
        JSON.stringify({ errorType: errType, message: fetchErr.message }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---- PARSE HTML ----
    // Extract colors from style tags and inline styles
    const colorMap = new Map<string, number>();

    function addColor(val: string) {
      const hex = toHex(val.trim());
      if (hex) colorMap.set(hex, (colorMap.get(hex) ?? 0) + 1);
    }

    // HIGHEST PRIORITY: meta theme-color
    const themeColorMatch = html.match(
      /<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i
    ) ?? html.match(
      /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']theme-color["']/i
    );
    if (themeColorMatch) {
      const hex = toHex(themeColorMatch[1]);
      if (hex) colorMap.set(hex, (colorMap.get(hex) ?? 0) + 200);
    }

    // HIGH PRIORITY: CSS variables
    const cssVarMatches = html.matchAll(
      /--(?:color-)?(?:primary|brand|accent|secondary)\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/gi
    );
    for (const m of cssVarMatches) {
      const hex = toHex(m[1]);
      if (hex) colorMap.set(hex, (colorMap.get(hex) ?? 0) + 80);
    }

    // MEDIUM PRIORITY: Extract from <style> tags
    const styleMatches = html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    for (const m of styleMatches) {
      extractColorsFromCSS(m[1]).forEach(c => addColor(c));
    }

    // Extract from inline style attributes
    const inlineMatches = html.matchAll(/style="([^"]*)"/gi);
    for (const m of inlineMatches) {
      extractColorsFromCSS(m[1]).forEach(c => addColor(c));
    }

    // Sort by frequency
    const allColors = [...colorMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([hex]) => hex);

    const isGray = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      return (max - min) < 30;
    };

    const getLightness = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return (Math.max(r, g, b) + Math.min(r, g, b)) / 2 * 100;
    };

    const getSaturation = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const l = (max + min) / 2;
      return max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
    };

    // Brand colors: saturation > 20%, lightness 25-75%, not gray
    const brandColors = allColors.filter(h => {
      const l = getLightness(h);
      const s = getSaturation(h);
      return s > 20 && l > 25 && l < 75 && !isGray(h);
    });

    // Light colors for background
    const lightColors = allColors.filter(h => getLightness(h) > 90);

    // Dark colors for text
    const darkColors = allColors.filter(h => getLightness(h) < 20);

    // Neutral grays
    const neutralColors = allColors.filter(h => {
      const l = getLightness(h);
      return isGray(h) && l > 15 && l < 90;
    });

    // Most saturated for accent
    const mostSaturated = brandColors.sort(
      (a, b) => getSaturation(b) - getSaturation(a)
    )[0];

    // Domain-based fallbacks
    const domainFallbacks: Record<string, string> = {
      "stripe.com": "#635bff",
      "airbnb.com": "#ff385c",
      "github.com": "#1f6feb",
      "shopify.com": "#96bf48",
      "vercel.com": "#000000",
      "linear.app": "#5e6ad2",
      "figma.com": "#1abcfe",
    };

    let fallbackPrimary = "#6366f1";
    try {
      const hostname = new URL(url).hostname.replace("www.", "");
      for (const [domain, color] of Object.entries(domainFallbacks)) {
        if (hostname.includes(domain)) {
          fallbackPrimary = color;
          break;
        }
      }
    } catch { /* ignore */ }

    const colors = {
      primary: brandColors[0] ?? fallbackPrimary,
      secondary: brandColors[1] ?? "#8b5cf6",
      accent: mostSaturated ?? "#f59e0b",
      background: lightColors[0] ?? "#ffffff",
      text: darkColors[0] ?? "#111827",
      neutrals: neutralColors.slice(0, 4).length > 0
        ? neutralColors.slice(0, 4)
        : ["#f3f4f6", "#d1d5db", "#9ca3af", "#6b7280"],
    };

    // ---- EXTRACT TYPOGRAPHY ----
    let headingFont = "Inter";
    let bodyFont = "Inter";
    let baseSize = "16px";
    let lineHeight = 1.5;
    const weights: number[] = [];

    // Google Fonts link
    const gfMatch = html.match(
      /fonts\.googleapis\.com\/css[^"']*family=([^"'&:]+)/i
    );
    if (gfMatch) {
      const fontName = decodeURIComponent(gfMatch[1]).replace(/\+/g, " ").split(":")[0].trim();
      if (fontName) { headingFont = fontName; bodyFont = fontName; }
    }

    // font-family from style tags
    const allStyleText = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
      .map(m => m[1]).join(" ");

    const fontFamilyMatches = allStyleText.matchAll(
      /font-family\s*:\s*([^;}{,]+)/gi
    );
    for (const m of fontFamilyMatches) {
      const font = m[1].replace(/['"]/g, "").split(",")[0].trim();
      if (font && font.toLowerCase() !== "inherit" &&
        font.toLowerCase() !== "sans-serif" &&
        font.toLowerCase() !== "serif" &&
        font.length > 2) {
        headingFont = font;
        bodyFont = font;
        break;
      }
    }

    // font-size of body
    const sizeMatch = allStyleText.match(
      /body[^{]*\{[^}]*font-size\s*:\s*([\d.]+(?:px|rem|em))/i
    );
    if (sizeMatch) baseSize = sizeMatch[1];

    // font-weights
    const weightMatches = allStyleText.matchAll(/font-weight\s*:\s*(\d{3})/g);
    for (const m of weightMatches) {
      const w = parseInt(m[1]);
      if (!weights.includes(w)) weights.push(w);
    }

    // line-height
    const lhMatch = allStyleText.match(/line-height\s*:\s*([\d.]+)/);
    if (lhMatch) lineHeight = parseFloat(lhMatch[1]);

    const typography = {
      headingFont,
      bodyFont,
      baseSize: baseSize || "16px",
      scaleRatio: 1.25,
      weights: weights.length > 0 ? weights.sort((a, b) => a - b) : [400, 600, 700],
      lineHeight: lineHeight || 1.5,
    };

    // ---- EXTRACT SPACING ----
    let spacingUnit = 4;
    const spacingVals: number[] = [];
    const spacingMatches = allStyleText.matchAll(
      /(?:padding|margin|gap)\s*:\s*([\d.]+)px/g
    );
    for (const m of spacingMatches) {
      const v = parseFloat(m[1]);
      if (v > 0 && v < 200) spacingVals.push(v);
    }
    if (spacingVals.length > 0) {
      const rounded = spacingVals.map(Math.round).filter(v => v > 0);
      const gcd = rounded.reduce((a, b) => {
        while (b) { [a, b] = [b, a % b]; }
        return a;
      });
      spacingUnit = Math.max(4, Math.min(gcd, 16));
    }

    const spacing = { unit: spacingUnit, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16] };

    const tokens = { colors, typography, spacing };

    // ---- SAVE TO SUPABASE ----
    const { error: tokenError } = await supabase
      .from("design_tokens")
      .insert({
        site_id: siteId,
        session_id: sessionId,
        colors,
        typography,
        spacing,
      });

    if (tokenError) throw tokenError;

    // Log version history (initial extraction)
    await supabase.from("version_history").insert({
      session_id: sessionId,
      token_path: "all",
      previous_value: null,
      new_value: "initial extraction",
      change_type: "scraped",
    });

    // Update site status
    await supabase.from("scraped_sites")
      .update({ extraction_status: "success" })
      .eq("id", siteId);

    return new Response(
      JSON.stringify({ success: true, sessionId, siteId, tokens }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ errorType: "server_error", message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ---- HELPER FUNCTIONS ----

function extractColorsFromCSS(css: string): string[] {
  const results: string[] = [];
  for (const m of css.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
    results.push("#" + m[1]);
  }
  for (const m of css.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
    results.push(rgbToHex(+m[1], +m[2], +m[3]));
  }
  return results;
}

function toHex(value: string): string | null {
  value = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    return "#" + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
  }
  const rgb = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) return rgbToHex(+rgb[1], +rgb[2], +rgb[3]);
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v =>
    Math.min(255, v).toString(16).padStart(2, "0")).join("");
}
