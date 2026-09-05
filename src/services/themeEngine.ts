// Unified Theme & Dynamic Brand Color Engine for FleetAurvexis
// Handles Light / Dark modes and dynamic palette calibration for dark mode contrast

export interface BrandPalette {
  shades: Record<number, string>;
  rgb: { r: number; g: number; b: number };
  glow: string;
  subtleBg: string;
  subtleBorder: string;
  textContrast: string;
  effectivePrimary: string;
}

export const adjustColorBrightness = (hex: string, percent: number): string => {
  try {
    let cleanHex = hex.trim().replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(char => char + char).join('');
    }
    if (cleanHex.length !== 6) {
      return hex;
    }
    
    let r = parseInt(cleanHex.substring(0, 2), 16);
    let g = parseInt(cleanHex.substring(2, 4), 16);
    let b = parseInt(cleanHex.substring(4, 6), 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return hex;
    }
    
    const factor = percent / 100;
    if (percent > 0) {
      r = Math.round(r + (255 - r) * factor);
      g = Math.round(g + (255 - g) * factor);
      b = Math.round(b + (255 - b) * factor);
    } else {
      r = Math.round(r + r * factor);
      g = Math.round(g + g * factor);
      b = Math.round(b + b * factor);
    }
    
    const clamp = (val: number) => Math.max(0, Math.min(255, val));
    const rHex = clamp(r).toString(16).padStart(2, '0');
    const gHex = clamp(g).toString(16).padStart(2, '0');
    const bHex = clamp(b).toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`;
  } catch {
    return hex;
  }
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  try {
    let clean = hex.trim().replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length !== 6) return { r: 103, g: 61, b: 230 };
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return {
      r: isNaN(r) ? 103 : r,
      g: isNaN(g) ? 61 : g,
      b: isNaN(b) ? 230 : b
    };
  } catch {
    return { r: 103, g: 61, b: 230 };
  }
};

export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export const hslToHex = (h: number, s: number, l: number): string => {
  h = (h % 360 + 360) % 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round((n + m) * 255))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Calculates a complete 10-shade tonal palette calibrated for either Light Mode or Dark Mode.
 * In Dark Mode:
 * - base tones gain increased luminescence so badges and icons pop against deep dark backgrounds (#05070a, #0b0f19)
 * - deep shades (50-200) are mapped to dark, rich tint backgrounds instead of light pastels
 * - high shades (800-900) are calibrated to luminous contrasting pastel highlights
 */
export const generateBrandPalette = (baseHex: string, isDark: boolean): BrandPalette => {
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  if (!isDark) {
    const shades: Record<number, string> = {
      50: adjustColorBrightness(baseHex, 94),
      100: adjustColorBrightness(baseHex, 84),
      200: adjustColorBrightness(baseHex, 68),
      300: adjustColorBrightness(baseHex, 48),
      400: adjustColorBrightness(baseHex, 24),
      500: baseHex,
      600: adjustColorBrightness(baseHex, -14),
      700: adjustColorBrightness(baseHex, -28),
      800: adjustColorBrightness(baseHex, -42),
      900: adjustColorBrightness(baseHex, -58),
    };
    return {
      shades,
      rgb,
      glow: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`,
      subtleBg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
      subtleBorder: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`,
      textContrast: shades[800],
      effectivePrimary: baseHex
    };
  }

  // Dark Mode Calibration:
  // Elevate lightness to ensure high contrast against dark surfaces
  const darkL = Math.max(hsl.l, 54);
  const darkS = Math.min(hsl.s + 6, 100);
  const darkPrimary = hslToHex(hsl.h, darkS, darkL);
  const darkRgb = hexToRgb(darkPrimary);

  const shades: Record<number, string> = {
    // Rich chromatic dark surface fills (card backgrounds, badge containers)
    50: hslToHex(hsl.h, Math.min(hsl.s, 40), 12),
    100: hslToHex(hsl.h, Math.min(hsl.s, 45), 18),
    200: hslToHex(hsl.h, Math.min(hsl.s, 50), 26),
    300: hslToHex(hsl.h, Math.min(hsl.s, 60), 38),
    400: hslToHex(hsl.h, Math.min(hsl.s, 70), 48),
    500: darkPrimary,
    600: hslToHex(hsl.h, darkS, Math.max(38, darkL - 9)),
    700: hslToHex(hsl.h, darkS, Math.max(30, darkL - 18)),
    // In dark mode, brand-800 text MUST be luminescent pastel for crystal clarity
    800: hslToHex(hsl.h, Math.min(hsl.s, 85), 85),
    900: hslToHex(hsl.h, Math.min(hsl.s, 80), 93),
  };

  return {
    shades,
    rgb: darkRgb,
    glow: `rgba(${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b}, 0.35)`,
    subtleBg: `rgba(${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b}, 0.14)`,
    subtleBorder: `rgba(${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b}, 0.32)`,
    textContrast: shades[800],
    effectivePrimary: darkPrimary
  };
};

export const applyBrandPaletteToDocument = (palette: BrandPalette) => {
  if (typeof document === 'undefined') return;
  try {
    const root = document.documentElement;
    Object.entries(palette.shades).forEach(([shade, hex]) => {
      root.style.setProperty(`--brand-${shade}`, hex);
      root.style.setProperty(`--color-brand-blue-${shade}`, hex);
    });
    root.style.setProperty('--color-brand-blue-250', palette.shades[200]);
    root.style.setProperty('--brand-rgb', `${palette.rgb.r}, ${palette.rgb.g}, ${palette.rgb.b}`);
    root.style.setProperty('--brand-glow', palette.glow);
    root.style.setProperty('--brand-subtle-bg', palette.subtleBg);
    root.style.setProperty('--brand-subtle-border', palette.subtleBorder);
    root.style.setProperty('--brand-text-contrast', palette.textContrast);
    root.style.setProperty('--brand-effective-primary', palette.effectivePrimary);
  } catch (e) {
    console.warn('Failed to apply brand palette to document', e);
  }
};

export const renderBrandInlineStyle = (color: string, isDark: boolean): string => {
  const palette = generateBrandPalette(color, isDark);
  return `
    :root, .dark, body, html {
      --brand-50: ${palette.shades[50]} !important;
      --brand-100: ${palette.shades[100]} !important;
      --brand-200: ${palette.shades[200]} !important;
      --brand-300: ${palette.shades[300]} !important;
      --brand-400: ${palette.shades[400]} !important;
      --brand-500: ${palette.shades[500]} !important;
      --brand-600: ${palette.shades[600]} !important;
      --brand-700: ${palette.shades[700]} !important;
      --brand-800: ${palette.shades[800]} !important;
      --brand-900: ${palette.shades[900]} !important;
      --color-brand-blue-50: ${palette.shades[50]} !important;
      --color-brand-blue-100: ${palette.shades[100]} !important;
      --color-brand-blue-200: ${palette.shades[200]} !important;
      --color-brand-blue-250: ${palette.shades[200]} !important;
      --color-brand-blue-300: ${palette.shades[300]} !important;
      --color-brand-blue-400: ${palette.shades[400]} !important;
      --color-brand-blue-500: ${palette.shades[500]} !important;
      --color-brand-blue-600: ${palette.shades[600]} !important;
      --color-brand-blue-700: ${palette.shades[700]} !important;
      --color-brand-blue-800: ${palette.shades[800]} !important;
      --color-brand-blue-900: ${palette.shades[900]} !important;
      --brand-rgb: ${palette.rgb.r}, ${palette.rgb.g}, ${palette.rgb.b} !important;
      --brand-glow: ${palette.glow} !important;
      --brand-subtle-bg: ${palette.subtleBg} !important;
      --brand-subtle-border: ${palette.subtleBorder} !important;
      --brand-text-contrast: ${palette.textContrast} !important;
      --brand-effective-primary: ${palette.effectivePrimary} !important;
    }
  `;
};

export const getStoredBrandColor = (): string => {
  if (typeof localStorage === 'undefined') return '#673de6';
  return (
    localStorage.getItem('saas_brand_primary_color') ||
    localStorage.getItem('saas_primary_color') ||
    '#673de6'
  );
};

export const setStoredBrandColor = (hex: string) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('saas_brand_primary_color', hex);
  localStorage.setItem('saas_primary_color', hex);
  window.dispatchEvent(new CustomEvent('brand-color-changed', { detail: { color: hex } }));
  window.dispatchEvent(new Event('storage'));
};
