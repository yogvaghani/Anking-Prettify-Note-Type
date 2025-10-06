(function initAnKingPalette() {
  if (window.__ankingPaletteInitialized) {
    if (typeof window.__ankingApplyPalette === 'function') {
      window.__ankingApplyPalette();
    }
    return;
  }
  window.__ankingPaletteInitialized = true;

  const root = document.documentElement;
  const defaultPalette = {
    light: {
      base: '#f4f7ff',
      accent: '#4d8bff',
      text: '#152238',
      glow: '#ffffff',
      overlay: 'linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0))',
      background: 'starsky.jpeg'
    },
    dark: {
      base: '#050b16',
      accent: '#7dafff',
      text: '#e6efff',
      glow: '#2bc1ff',
      overlay: 'rgba(4, 10, 24, 0.45)',
      background: 'starsky.jpeg'
    }
  };
  const paletteConfig = (window.AnKingConfig && window.AnKingConfig.themePalette) || {};
  const backgroundsConfig = paletteConfig.backgrounds || {};
  let paletteLight = buildPalette(Object.assign({}, defaultPalette.light, paletteConfig.light || {}));
  let paletteDark = buildPalette(Object.assign({}, defaultPalette.dark, paletteConfig.dark || {}));
  const backgrounds = {
    light: backgroundsConfig.light || paletteLight.background || defaultPalette.light.background,
    dark: backgroundsConfig.dark || paletteDark.background || defaultPalette.dark.background
  };

  const cardElement = document.querySelector('.prettify-flashcard');
  if (cardElement && cardElement.dataset) {
    backgrounds.light = cardElement.dataset.ankiBackgroundLight || backgrounds.light;
    backgrounds.dark = cardElement.dataset.ankiBackgroundDark || backgrounds.dark;
  }

  updatePaletteStatics();

  const applyPalette = () => {
    const body = document.body;
    if (!body) return;
    const mode = body.classList.contains('night_mode') ? 'dark' : 'light';
    const palette = mode === 'dark' ? paletteDark : paletteLight;
    const backgroundValue = mode === 'dark' ? backgrounds.dark : backgrounds.light;
    setVar('--anki-background-image', toCssBackground(backgroundValue));
    setVar('--anki-background-color', palette.base.hex);
    const overlayValue = palette.overlay || (mode === 'dark'
      ? 'rgba(4, 10, 24, 0.45)'
      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0))');
    setVar('--anki-background-overlay', overlayValue);
    updateBaseVariables(palette, mode);
    setVar('--anki-palette-base', palette.base.hex);
    setVar('--anki-palette-accent', palette.accent.hex);
    setVar('--anki-palette-text', palette.text.hex);
    setVar('--anki-palette-glow', palette.glow.hex);
  };

  window.__ankingApplyPalette = applyPalette;

  const ensureApply = () => {
    const body = document.body;
    if (!body) {
      requestAnimationFrame(ensureApply);
      return;
    }
    applyPalette();
    if (window.__ankingPaletteObserver) {
      try { window.__ankingPaletteObserver.disconnect(); } catch (err) {}
    }
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.attributeName === 'class')) {
        applyPalette();
      }
    });
    observer.observe(body, { attributes: true });
    window.__ankingPaletteObserver = observer;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureApply, { once: true });
  } else {
    ensureApply();
  }

  Promise.all([
    adaptPaletteToBackground('light', backgrounds.light),
    adaptPaletteToBackground('dark', backgrounds.dark)
  ]).catch(() => {});

  window.AnKingSetBackgrounds = function(nextBackgrounds) {
    if (!nextBackgrounds) {
      return;
    }
    if (nextBackgrounds.light) {
      backgrounds.light = nextBackgrounds.light;
    }
    if (nextBackgrounds.dark) {
      backgrounds.dark = nextBackgrounds.dark;
    }
    updatePaletteStatics();
    if (document.body) {
      applyPalette();
    }
    adaptPaletteToBackground('light', backgrounds.light);
    adaptPaletteToBackground('dark', backgrounds.dark);
  };

  window.AnKingGetBackgrounds = function() {
    return { light: backgrounds.light, dark: backgrounds.dark };
  };

  function buildPalette(entry) {
    const base = parseColor(entry.base, '#ffffff');
    const accent = parseColor(entry.accent, '#4d8bff');
    const text = parseColor(entry.text, '#152238');
    const glow = parseColor(entry.glow || entry.accent, accent.hex);
    return {
      base,
      accent,
      text,
      glow,
      overlay: entry.overlay,
      background: entry.background
    };
  }

  function updateBaseVariables(palette, mode) {
    const base = palette.base.hsl;
    const accent = palette.accent.hsl;
    const text = palette.text.hsl;
    setVar('--p-hue-bg', base.h.toFixed(2));
    setVar('--p-bg-s', clamp(base.s, 5, 95).toFixed(2) + '%');
    setVar('--p-bg-l', clamp(base.l + (mode === 'light' ? 8 : 3), 8, 96).toFixed(2) + '%');
    setVar('--p-bg-l-dark', clamp(base.l - 35, 3, 55).toFixed(2) + '%');
    setVar('--p-hue-accent', accent.h.toFixed(2));
    setVar('--p-accent-s', clamp(accent.s, 18, 98).toFixed(2) + '%');
    setVar('--p-accent-l', clamp(accent.l + (mode === 'light' ? 6 : 2), 12, 88).toFixed(2) + '%');
    setVar('--p-accent-l-dark', clamp(accent.l - 12, 10, 70).toFixed(2) + '%');
    setVar('--p-text-s', clamp(text.s, 12, 70).toFixed(2) + '%');
    setVar('--p-text-l', clamp(text.l, 18, 65).toFixed(2) + '%');
    setVar('--p-text-l-dark', clamp(text.l + 40, 55, 96).toFixed(2) + '%');
    setVar('--p-bold-fg', palette.accent.hex);
    setVar('--p-italic-fg', adjustHexLightness(palette.accent.hex, 12));
    setVar('--p-underline-fg', adjustHexLightness(palette.accent.hex, -10));
    setVar('--p-bold-italic-fg', adjustHexLightness(palette.accent.hex, 20));
    setVar('--p-bold-fg-dark', adjustHexLightness(palette.accent.hex, 28));
    setVar('--p-italic-fg-dark', adjustHexLightness(palette.accent.hex, 18));
    setVar('--p-underline-fg-dark', adjustHexLightness(palette.accent.hex, -18));
    setVar('--p-bold-italic-fg-dark', adjustHexLightness(palette.accent.hex, 34));
  }

  function updatePaletteStatics() {
    setVar('--anki-background-color-light', paletteLight.base.hex);
    setVar('--anki-background-color-dark', paletteDark.base.hex);
    if (paletteLight.overlay) {
      setVar('--anki-background-overlay-light', paletteLight.overlay);
    }
    if (paletteDark.overlay) {
      setVar('--anki-background-overlay-dark', paletteDark.overlay);
    }
    setVar('--anki-background-image-light', toCssBackground(backgrounds.light));
    setVar('--anki-background-image-dark', toCssBackground(backgrounds.dark));
    setVar('--c-text-primary-light', toHslString(paletteLight.text.hsl));
    setVar('--c-text-secondary-light', toHslString(lightenHSL(paletteLight.text.hsl, 12)));
    setVar('--c-text-primary-dark', toHslString(paletteDark.text.hsl));
    setVar('--c-text-secondary-dark', toHslString(lightenHSL(paletteDark.text.hsl, 10)));
  }

  function adaptPaletteToBackground(mode, backgroundValue) {
    const source = stripUrlValue(backgroundValue);
    if (!source || !isImageSource(source)) {
      return Promise.resolve(null);
    }
    return analyzeImagePalette(source, mode).then((derived) => {
      if (!derived) {
        return null;
      }
      const target = mode === 'dark' ? paletteDark : paletteLight;
      if (derived.base) target.base = derived.base;
      if (derived.accent) target.accent = derived.accent;
      if (derived.text) target.text = derived.text;
      if (derived.glow) target.glow = derived.glow;
      if (derived.overlay) target.overlay = derived.overlay;
      updatePaletteStatics();
      if (document.body) {
        applyPalette();
      }
      return derived;
    }).catch((err) => {
      console.warn('AnKing Prettify: unable to derive palette from background', err);
      return null;
    });
  }

  function analyzeImagePalette(source, mode) {
    return loadImage(source).then((img) => {
      const imageData = sampleImage(img, 96);
      if (!imageData) {
        return null;
      }
      const stats = computeImageStats(imageData);
      if (!stats) {
        return null;
      }

      const averageHex = rgbToHex(stats.average.r, stats.average.g, stats.average.b);
      let baseColor = parseHexColor(averageHex);
      if (!baseColor) {
        return null;
      }
      let baseH = baseColor.hsl.h;
      let baseS = baseColor.hsl.s;
      let baseL = baseColor.hsl.l;
      if (mode === 'light') {
        baseS = clamp(baseS * 0.75 + 12, 18, 72);
        baseL = clamp((baseL + 70) / 1.2, 55, 90);
      } else {
        baseS = clamp(baseS * 0.9 + 8, 18, 85);
        baseL = clamp((baseL + 30) / 1.5, 12, 42);
      }
      baseColor = parseHexColor(hslToHex(baseH, baseS, baseL));

      const accentCandidate = stats.vibrant || stats.average;
      let accentColor = parseHexColor(rgbToHex(accentCandidate.r, accentCandidate.g, accentCandidate.b)) || baseColor;
      let accentH = accentColor.hsl.h;
      let accentS = accentColor.hsl.s;
      let accentL = accentColor.hsl.l;
      if (mode === 'light') {
        accentS = clamp(accentS + 22, 28, 96);
        accentL = clamp(accentL + 6, 28, 76);
      } else {
        accentS = clamp(accentS + 24, 34, 98);
        accentL = clamp(accentL + 4, 20, 64);
      }
      accentColor = parseHexColor(hslToHex(accentH, accentS, accentL)) || accentColor;
      if (contrastRatioColors(baseColor, accentColor) < 1.6) {
        const adjustAmount = mode === 'light' ? -18 : 18;
        accentColor = parseHexColor(adjustHexLightness(accentColor.hex, adjustAmount)) || accentColor;
      }

      const baseLum = getRelativeLuminance(baseColor.rgb.r, baseColor.rgb.g, baseColor.rgb.b);
      const textSeed = baseLum > 0.55 ? (stats.dark || { r: 24, g: 32, b: 46 }) : (stats.light || { r: 240, g: 244, b: 255 });
      let textColor = parseHexColor(rgbToHex(textSeed.r, textSeed.g, textSeed.b));
      if (!textColor) {
        textColor = parseHexColor(baseLum > 0.55 ? '#101828' : '#f7f9ff');
      }
      textColor = ensureContrast(baseColor, textColor, baseLum > 0.55 ? 'dark' : 'light');

      const glowHex = adjustHexLightness(accentColor.hex, mode === 'light' ? 32 : 42);
      const glowColor = parseHexColor(glowHex) || accentColor;

      const overlay = mode === 'light'
        ? buildLightOverlay(baseColor, accentColor)
        : buildDarkOverlay(baseColor, accentColor);

      return { base: baseColor, accent: accentColor, text: textColor, glow: glowColor, overlay };
    }).catch(() => null);
  }

  function buildLightOverlay(baseColor, accentColor) {
    const accent = accentColor.rgb;
    const overlayTop = 'rgba(255, 255, 255, 0.58)';
    const overlayBottom = 'rgba(' + Math.round(accent.r) + ', ' + Math.round(accent.g) + ', ' + Math.round(accent.b) + ', 0.18)';
    return 'linear-gradient(180deg, ' + overlayTop + ' 0%, ' + overlayBottom + ' 100%)';
  }

  function buildDarkOverlay(baseColor, accentColor) {
    const base = baseColor.rgb;
    return 'rgba(' + Math.round(base.r) + ', ' + Math.round(base.g) + ', ' + Math.round(base.b) + ', 0.45)';
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      try {
        img.src = source;
      } catch (err) {
        reject(err);
      }
    });
  }

  function sampleImage(img, maxSize) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return null;
    }
    const ratio = Math.max(img.naturalWidth, img.naturalHeight) / Math.max(maxSize, 32);
    const width = Math.max(1, Math.round(img.naturalWidth / ratio));
    const height = Math.max(1, Math.round(img.naturalHeight / ratio));
    canvas.width = width;
    canvas.height = height;
    context.drawImage(img, 0, 0, width, height);
    try {
      return context.getImageData(0, 0, width, height);
    } catch (err) {
      console.warn('AnKing Prettify: unable to sample background image', err);
      return null;
    }
  }

  function computeImageStats(imageData) {
    if (!imageData || !imageData.data) {
      return null;
    }
    const data = imageData.data;
    let count = 0;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let vibrant = null;
    let highestSat = 0;
    let light = null;
    let darkest = null;
    let highestLum = -1;
    let lowestLum = 2;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3] / 255;
      if (alpha < 0.1) {
        continue;
      }
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      sumR += r;
      sumG += g;
      sumB += b;
      count++;
      const hsl = rgbToHsl(r, g, b);
      const lum = getRelativeLuminance(r, g, b);
      if (hsl.s > highestSat && lum > 0.12 && lum < 0.92) {
        highestSat = hsl.s;
        vibrant = { r, g, b, hsl };
      }
      if (lum > highestLum) {
        highestLum = lum;
        light = { r, g, b, hsl };
      }
      if (lum < lowestLum) {
        lowestLum = lum;
        darkest = { r, g, b, hsl };
      }
    }
    if (!count) {
      return null;
    }
    const average = { r: sumR / count, g: sumG / count, b: sumB / count };
    if (!vibrant) {
      const avgHsl = rgbToHsl(average.r, average.g, average.b);
      vibrant = { r: average.r, g: average.g, b: average.b, hsl: avgHsl };
    }
    return { average, vibrant, light, dark: darkest };
  }

  function ensureContrast(baseColor, candidateColor, tone) {
    let current = candidateColor || parseHexColor(tone === 'dark' ? '#101828' : '#f7f9ff');
    if (!current) {
      current = parseHexColor(tone === 'dark' ? '#101828' : '#f7f9ff');
      if (!current) {
        return candidateColor;
      }
    }
    let ratio = contrastRatioColors(baseColor, current);
    let iterations = 0;
    const delta = tone === 'dark' ? -6 : 6;
    while (ratio < 4.2 && iterations < 10) {
      const adjusted = adjustHexLightness(current.hex, delta);
      const parsed = parseHexColor(adjusted);
      if (!parsed) {
        break;
      }
      current = parsed;
      ratio = contrastRatioColors(baseColor, current);
      iterations++;
    }
    return current;
  }

  function contrastRatioColors(colorA, colorB) {
    const lumA = getRelativeLuminance(colorA.rgb.r, colorA.rgb.g, colorA.rgb.b);
    const lumB = getRelativeLuminance(colorB.rgb.r, colorB.rgb.g, colorB.rgb.b);
    return contrastRatio(lumA, lumB);
  }

  function contrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function getRelativeLuminance(r, g, b) {
    const srgb = [r, g, b].map((value) => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  }

  function toCssBackground(value) {
    if (!value && value !== 0) {
      return '';
    }
    const raw = value.toString().trim();
    if (!raw) {
      return '';
    }
    if (/^(url\(|linear-gradient\(|radial-gradient\(|conic-gradient\(|repeating-linear-gradient\(|repeating-radial-gradient\(|var\(|#)/i.test(raw)) {
      return raw;
    }
    if (raw.startsWith('data:image')) {
      return "url('" + raw + "')";
    }
    return "url('" + raw.replace(/'/g, "\\'") + "')";
  }

  function stripUrlValue(value) {
    if (!value && value !== 0) {
      return '';
    }
    const raw = value.toString().trim();
    const match = raw.match(/^url\((.*)\)$/i);
    if (match) {
      return match[1].trim().replace(/^['"]|['"]$/g, '');
    }
    return raw.replace(/^['"]|['"]$/g, '');
  }

  function isImageSource(value) {
    if (!value) {
      return false;
    }
    if (value.startsWith('data:image')) {
      return true;
    }
    return /\.(png|jpe?g|gif|bmp|webp|avif|svg)(\?.*)?$/i.test(value);
  }

  function parseColor(value, fallbackHex) {
    const parsed = parseColorValue(value) || parseColorValue(fallbackHex) || parseHexColor('#ffffff');
    return parsed;
  }

  function parseColorValue(value) {
    if (!value) return null;
    let input = String(value).trim();
    if (!input) return null;
    if (input.startsWith('#')) {
      return parseHexColor(input);
    }
    const rgbMatch = input.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
      const parts = rgbMatch[1].split(',').map((part) => parseFloat(part.trim()));
      if (parts.length >= 3) {
        return parseHexColor(rgbToHex(parts[0], parts[1], parts[2]));
      }
    }
    return parseHexColor(input);
  }

  function parseHexColor(hex) {
    const normalized = normalizeHex(hex);
    if (!normalized) return null;
    const rgb = hexToRgb(normalized);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { hex: normalized, rgb, hsl };
  }

  function normalizeHex(hex) {
    if (!hex) return null;
    let value = hex.toString().trim();
    if (value.startsWith('#')) {
      value = value.slice(1);
    }
    if (value.length === 3) {
      value = value.split('').map((ch) => ch + ch).join('');
    }
    if (value.length !== 6) return null;
    if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
    return '#' + value.toLowerCase();
  }

  function hexToRgb(hex) {
    const value = parseInt(hex.slice(1), 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255
    };
  }

  function rgbToHex(r, g, b) {
    const toHex = (v) => {
      const clamped = clamp(Math.round(v), 0, 255);
      return clamped.toString(16).padStart(2, '0');
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return { h: h || 0, s: s * 100, l: l * 100 };
  }

  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    const to255 = (v) => clamp(Math.round((v + m) * 255), 0, 255);
    return rgbToHex(to255(r), to255(g), to255(b));
  }

  function lightenHSL(hsl, delta) {
    return {
      h: hsl.h,
      s: clamp(hsl.s + (delta > 0 ? delta * 0.2 : delta * 0.3), 0, 100),
      l: clamp(hsl.l + delta, 0, 100)
    };
  }

  function adjustHexLightness(hex, delta) {
    const color = parseHexColor(hex);
    if (!color) return hex;
    const adjusted = lightenHSL(color.hsl, delta);
    return hslToHex(adjusted.h, adjusted.s, adjusted.l);
  }

  function toHslString(hsl) {
    return 'hsl(' + hsl.h.toFixed(2) + ', ' + clamp(hsl.s, 0, 100).toFixed(2) + '%, ' + clamp(hsl.l, 0, 100).toFixed(2) + '%)';
  }

  function setVar(name, value) {
    if (value !== undefined && value !== null) {
      root.style.setProperty(name, value);
    }
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
})();
// Shared runtime for the AnKing note type.
const __ankingRoot = document.querySelector('.prettify-flashcard');
const __ankingSide = (__ankingRoot && __ankingRoot.dataset && __ankingRoot.dataset.ankingSide) || 'front';

if (typeof(window.Persistence) === 'undefined') {
  var _persistenceKey = 'github.com/SimonLammer/anki-persistence/';
  var _defaultKey = '_default';
  window.Persistence_sessionStorage = function() { // used in android, iOS, web
    var isAvailable = false;
    try {
      if (typeof(window.sessionStorage) === 'object') {
        isAvailable = true;
        this.clear = function() {
          for (var i = 0; i < sessionStorage.length; i++) {
            var k = sessionStorage.key(i);
            if (k.indexOf(_persistenceKey) == 0) {
              sessionStorage.removeItem(k);
              i--;
            }
          };
        };
        this.setItem = function(key, value) {
          if (value == undefined) {
            value = key;
            key = _defaultKey;
          }
          sessionStorage.setItem(_persistenceKey + key, JSON.stringify(value));
        };
        this.getItem = function(key) {
          if (key == undefined) {
            key = _defaultKey;
          }
          return JSON.parse(sessionStorage.getItem(_persistenceKey + key));
        };
        this.removeItem = function(key) {
          if (key == undefined) {
            key = _defaultKey;
          }
          sessionStorage.removeItem(_persistenceKey + key);
        };
        this.getAllKeys = function () {
          var keys = [];
          var prefixedKeys = Object.keys(sessionStorage);
          for (var i = 0; i < prefixedKeys.length; i++) {
            var k = prefixedKeys[i];
            if (k.indexOf(_persistenceKey) == 0) {
              keys.push(k.substring(_persistenceKey.length, k.length));
            }
          };
          return keys.sort()
        }
      }
    } catch(err) {}
    this.isAvailable = function() {
      return isAvailable;
    };
  };
  window.Persistence_windowKey = function(persistentKey) { // used in windows, linux, mac
    var obj = window[persistentKey];
    var isAvailable = false;
    if (typeof(obj) === 'object') {
      isAvailable = true;
      this.clear = function() {
        obj[_persistenceKey] = {};
      };
      this.setItem = function(key, value) {
        if (value == undefined) {
          value = key;
          key = _defaultKey;
        }
        obj[_persistenceKey][key] = value;
      };
      this.getItem = function(key) {
        if (key == undefined) {
          key = _defaultKey;
        }
        return obj[_persistenceKey][key] == undefined ? null : obj[_persistenceKey][key];
      };
      this.removeItem = function(key) {
        if (key == undefined) {
          key = _defaultKey;
        }
        delete obj[_persistenceKey][key];
      };
      this.getAllKeys = function () {
        return Object.keys(obj[_persistenceKey]);
      }

      if (obj[_persistenceKey] == undefined) {
        this.clear();
      }
    }
    this.isAvailable = function() {
      return isAvailable;
    };
  };
  /*
   *   client  | sessionStorage | persistentKey | useful location |
   * ----------|----------------|---------------|-----------------|
   * web       |       YES      |       -       |       NO        |
   * windows   |       NO       |       py      |       NO        |
   * android   |       YES      |       -       |       NO        |
   * linux 2.0 |       NO       |       qt      |       YES       |
   * linux 2.1 |       NO       |       qt      |       YES       |
   * mac 2.0   |       NO       |       py      |       NO        |
   * mac 2.1   |       NO       |       qt      |       YES       |
   * iOS       |       YES      |       -       |       NO        |
   */
  window.Persistence = new Persistence_sessionStorage(); // android, iOS, web
  if (!Persistence.isAvailable()) {
    window.Persistence = new Persistence_windowKey("py"); // windows, mac (2.0)
  }
  if (!Persistence.isAvailable()) {
    var titleStartIndex = window.location.toString().indexOf('title'); // if titleStartIndex > 0, window.location is useful
    var titleContentIndex = window.location.toString().indexOf('main', titleStartIndex);
    if (titleStartIndex > 0 && titleContentIndex > 0 && (titleContentIndex - titleStartIndex) < 10) {
      window.Persistence = new Persistence_windowKey("qt"); // linux, mac (2.1)
    }
  }
}

  if (window.ankingEventListeners) {
    for (const listener of ankingEventListeners) {
      const type = listener[0]
      const handler = listener[1]
      document.removeEventListener(type, handler)
    }
  }
  window.ankingEventListeners = []

  window.ankingAddEventListener = function(type, handler) {
    document.addEventListener(type, handler)
    window.ankingEventListeners.push([type, handler])
  }

  var specialCharCodes = {
    "-": "minus",
    "=": "equal",
    "[": "bracketleft",
    "]": "bracketright",
    ";": "semicolon",
    "'": "quote",
    "`": "backquote",
    "\\": "backslash",
    ",": "comma",
    ".": "period",
    "/": "slash",
  };
  // Returns function that match keyboard event to see if it matches given shortcut.
  function shortcutMatcher(shortcut) {
    let shortcutKeys = shortcut.toLowerCase().split(/[+]/).map(key => key.trim())
    let mainKey = shortcutKeys[shortcutKeys.length - 1]
    if (mainKey.length === 1) {
      if (/\d/.test(mainKey)) {
        mainKey = "digit" + mainKey
      } else if (/[a-zA-Z]/.test(mainKey)) {
        mainKey = "key" + mainKey
      } else {
        let code = specialCharCodes[mainKey];
        if (code) {
          mainKey = code
        }
      }
    }
    let ctrl = shortcutKeys.includes("ctrl")
    let shift = shortcutKeys.includes("shift")
    let alt = shortcutKeys.includes("alt")

    let matchShortcut = function (ctrl, shift, alt, mainKey, event) {
      if (mainKey !== event.code.toLowerCase()) return false
      if (ctrl !== (event.ctrlKey || event.metaKey)) return false
      if (shift !== event.shiftKey) return false
      if (alt !== event.altKey) return false
      return true
    }.bind(window, ctrl, shift, alt, mainKey)

    return matchShortcut
  }

    for (const image of document.querySelectorAll(".blur")) {
        image.classList.add("tappable");
        image.addEventListener("click", () => {
            image.classList.toggle("blur");
        });
    }

    function shuffle(array) {
        let currentIndex = array.length;
        while (currentIndex != 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex],
                array[currentIndex],
            ];
        }
    }

    function shuffleElements(elements) {
        const shuffledElements = Array.from(
            elements.map((el) => el.cloneNode(true))
        );
        shuffle(shuffledElements);
        for (let i = 0; i < elements.length; i++) {
            elements[i].replaceWith(shuffledElements[i]);
        }
    }

    function shuffleList(listElement) {
        const items = Array.from(listElement.querySelectorAll("li"));
        shuffleElements(items);
    }

    (() => {
        const selectors = [".shuffle"];
        for (const selector of selectors) {
            for (const container of document.querySelectorAll(selector)) {
                if (["UL", "OL"].includes(container.tagName)) {
                    shuffleList(container);
                }
                for (const parentElement of container.querySelectorAll(
                    "ol, ul"
                )) {
                    shuffleList(parentElement);
                }
                const images = Array.from(container.querySelectorAll("img"));
                shuffleElements(images);
            }
        }
    })();

  function countdown(elementName, minutes, seconds) {
    var element, endTime, mins, msLeft, time;
    function twoDigits( n ) {
      return (n <= 9 ? "0" + n : n);
    }
    function updateTimer() {
      msLeft = endTime - (+new Date);

      if ( msLeft < 1000 ) {
        element.innerHTML = timeOverMsg;
      } else {
        time = new Date( msLeft );
        mins = time.getUTCMinutes();
        element.innerHTML = mins + ':' + twoDigits(time.getUTCSeconds());
        setTimeout( updateTimer, time.getUTCMilliseconds() + 500 );
      }
    }
    element = document.getElementById(elementName);
    endTime = (+new Date) + 1000 * (60*minutes + seconds) + 500;
    updateTimer();
  }
  countdown("s2", minutes, seconds ); //2nd value is the minute, 3rd is the seconds

    //DONT FADE BETWEEN CARDS
	qFade=0; if (typeof anki !== 'undefined') anki.qFade=qFade;

  var tagContainer = document.getElementById("tags-container");
  if (!tagContainer) { return; }
  var tagList;
  if (tagContainer.childElementCount == 0) {
    tagList = tagContainer.innerHTML.split(" ");
    var kbdList = [];
    var newTagContent = document.createElement("div");

    for (var i = 0; i < tagList.length; i++) {
      var newTag = document.createElement("kbd");
      var tag = tagList[i];
      // numTagLevelsToShow == 0 means the whole tag should be shown
      if(numTagLevelsToShow != 0){
        tag = tag.split('::').slice(-numTagLevelsToShow).join("::");
      }
      newTag.innerHTML = tag;
      newTagContent.append(newTag)
    }
    tagContainer.innerHTML = newTagContent.innerHTML;
    tagContainer.style.cursor = "default";
  }
  else {
    tagList = Array.from(tagContainer.children).map(e => e.innerText);
  }
  globalThis.tagList = tagList.map(t => t.trim().toLowerCase());
  if (tagContainer.innerHTML.indexOf(tagID) != -1) {
    tagContainer.style.backgroundColor = "rgba(251,11,11,.15)";
  }

  function showtags() {
    var tagContainerShortcut = document.getElementById("tags-container");

    if (tagContainerShortcut.style.display
      === "none") {
      tagContainerShortcut.style.display = "block";
    } else {
      tagContainerShortcut.style.display =
        "none";
    }
  }

  var isShortcut = shortcutMatcher(toggleTagsShortcut)
  ankingAddEventListener('keyup', function (e) {
      if (isShortcut(e)) {
          showtags();
      }
  });
(function() {
  // Introduce a small delay (e.g., 50-100 milliseconds)
  setTimeout(function() {
    const cardElement = document.querySelector('.prettify-flashcard');
    if (cardElement) {
      // Remove class first to ensure re-trigger if already present from a quick flip or re-render
      cardElement.classList.remove('card-bounce-animation');
      // Force reflow to help ensure animation restarts if class was just re-added
      void cardElement.offsetWidth;
      // Add class to trigger animation
      cardElement.classList.add('card-bounce-animation');

      // Remove the class after the animation completes so it can be triggered again
      // if the card is shown again (e.g. after editing or if Anki reuses the webview).
      // The duration should match the CSS animation-duration (0.5s).
      setTimeout(() => {
        if (cardElement) { // Check if element still exists
          cardElement.classList.remove('card-bounce-animation');
        }
      }, 500); // Duration of the bounce animation in milliseconds
    }
  }, 100); // Delay in milliseconds (e.g., 100ms)
})();

  // This script adds a class to the body for special theme effects
  // like the Aurora background.
  if (document.querySelector('.theme-aurora')) {
    document.body.classList.add('aurora-bg');
  }

(function () {
  if (!document.documentElement.classList.contains('is-windows')) {
    if (navigator.userAgent && /Windows/i.test(navigator.userAgent)) {
      document.documentElement.classList.add('is-windows');
    }
  }
})();

(function(){
  const qa = document.getElementById('qa');
  if (qa) {
    if (getComputedStyle(qa).display === 'none') qa.style.removeProperty('display');
    qa.style.visibility = 'visible';
  }

  // Force a stable layer and immediate paint for the card
  const card = document.querySelector('.prettify-flashcard');
  if (card) {
    const t = card.style.transform || '';
    // micro translateZ forces allocation; revert on next frame
    card.style.transform = t + ' translateZ(0.0001px)';
    requestAnimationFrame(() => { card.style.transform = t; });
  }
})();
if (__ankingSide === 'front') {
  
    // enables cloze one-by-one even when one-by-one field is empty
    // minNumberOfClozes is still considered in this case
    // overridden in importance by selectiveOneByOne
    var alwaysOneByOne = false;
    var clozeOneByOneEnabled = true;
    var oneByOneField = document.getElementById("one-by-one");`r`n  if (!oneByOneField) {`r`n    Persistence.setItem("clozeHints", []);`r`n    return;`r`n  }`r`n  var oneByOneFieldNotEmpty = oneByOneField.textContent !== "";
      clozeOneByOneEnabled = alwaysOneByOne || oneByOneFieldNotEmpty;
  
    var clozeHints = [];
    if (clozeOneByOneEnabled) {
      document.getElementById("qa").classList.add('one-by-one');
      // Save cloze hints to display in the back
      let clozes = document.getElementsByClassName("cloze")
      for(var i = 0; i < clozes.length; i++) {
        clozes[i].classList.add("one-by-one");
        if (clozes[i].innerHTML === "[...]") {
          clozeHints.push("")
        } else {
          clozeHints.push(clozes[i].innerHTML)
        }
      }
  
      // --- CHECK IF ONE BY ONE SHOULD BE ENABLED FOR THIS SPECIFIC CARD ---
      /**
       * Credit for the getCardNumber function goes to foenixx (GitHub) / ollevolle (AnkiWeb Forum)
       */
       const getCardNumber = function () {
        clz = document.body.className;
        const regex = /card(\d+)/gm;
        let m;
  
        if ((m = regex.exec(clz)) !== null) {
          return m[1];
        } else {
          // Should only fire if card is not cloze
          console.error("Cannot find cardN class of body element!");
          return "0";
        }
      }
  
      var alreadyRendered = false;
  
      function processSelective1b1() {
        if (alreadyRendered) return;
        // parse the cloze numbers for which selectiveOneByOne is enabled
        var clozeNumbers = oneByOneField.textContent.split(',').filter(element => element).map(Number)
        var cardNumberIsOneByOne = !clozeNumbers.filter(n => !Number.isNaN(n)).length || clozeNumbers.includes(parseInt(getCardNumber()))
  
        // check the amount of clozes -> disable OneByOne if less than minimum value wanted (minNumberOfClozes)
        var numClozesForNumber = (minNumberOfClozes) ? document.querySelectorAll('.clozefield .cloze').length : 0
  
        // stop OneByOne if selectiveOneByOne is not enabled for this specific card OR if OneByOne is disabled some other way
        // -> show normal backside
        if (!alwaysOneByOne && ((selectiveOneByOne && !cardNumberIsOneByOne) || (oneByOneFieldNotEmpty && (numClozesForNumber < minNumberOfClozes)))) {
          clozeOneByOneEnabled = false
        }
  
        if (autoflip && clozeOneByOneEnabled) {
  
      if(window.pycmd || window.showAnswer) {
          // avoid flickering. Must unset this in the back.
          document.getElementById("qa").style.display = "none";
      }
  
      if (window.pycmd) {
          pycmd("ans")
      } else if (window.showAnswer) {
          showAnswer()
      }
  }
  // AnkiMobile JS API doesn't have one for show answer.
  // Best alternative is to use Taps/Swipes to show answer.
  
        alreadyRendered = true;
      }
  
      function delayedProcessSelective1b1() {
        if (window.requestAnimationFrame) window.requestAnimationFrame(processSelective1b1); // less flickering
        else window.setTimeout(processSelective1b1, 0);
      };
  
      window.onload = delayedProcessSelective1b1;
      if (document.readyState === "complete") {
        delayedProcessSelective1b1();
      }
      else {
        document.addEventListener("DOMContentLoaded", delayedProcessSelective1b1);
      }
  
      // Observe document.body class changes to trigger re-rendering.
      // This is useful, because Anki doesnâ€™t always start with an up-to-date class list:
      // https://forums.ankiweb.net/t/card-card-classes-only-injected-separately-now/27387.
      const observer = new MutationObserver(function(mutationsList, observer) {
        for (let mutation of mutationsList) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            delayedProcessSelective1b1();
          }
        }
      });
      observer.observe(document.body, { attributes: true });
    }
    Persistence.setItem("clozeHints", clozeHints);
}
if (__ankingSide === 'back') {
  
      (function () {
          function tagToResourceTitleAndSlug(tag, resourceSlug) {
              try {
                  // Extract step number
                  const stepMatch = tag.match(/#AK_Step(\d+)_v12::/i);
                  if (!stepMatch) return null;
                  const step = parseInt(stepMatch[1]);
  
                  // Process path
                  let path = tag.replace(/.+_v12::#.+?::/i, '');
                  let pathParts = path.split('::');
                  pathParts = pathParts.map(part => part.toLowerCase());
  
                  // Remove path parts after first path part starting with "*"
                  for (let index = 0; index < pathParts.length; index++) {
                      if (pathParts[index].startsWith("*")) {
                          pathParts = pathParts.slice(0, index);
                          break;
                      }
                  }
  
                  // Remove the last part if it is "extra"
                  if (pathParts[pathParts.length - 1] === "extra") {
                      pathParts = pathParts.slice(0, -1);
                  }
                  
                  // Create slug
                  const contentNumbers = pathParts
                      .map(part => part.match(/\d+/))
                      .map(matchArray => parseInt(matchArray[0], 10));
  
                  const slug = `step${step}-${resourceSlug}-${contentNumbers.join('-')}`;
  
                  // Create title
                  const title = pathParts[pathParts.length - 1]
                      .replace(/^\d+_/g, '')
                      .replace(/_/g, ' ')
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
  
                  const titleWithStep = `Step ${step} - ${title}`;
  
                  return { "title": titleWithStep, slug };
              } catch (error) {
                  return null;
              }
          }
  
          function createResourceUrl(slug) {
              return `https://app.ankihub.net/integrations/mcgraw-hill/${slug}`;
          }
  
          function getResourceTags(tags, resourceTypeTagPart) {
              const searchPattern = `v12::${resourceTypeTagPart}`.toLowerCase();
              return tags.filter(tag => tag.toLowerCase().includes(searchPattern));
          }
  
          function setupTagBasedHintButton(hintButton) {
              const resourceTags = getResourceTags(tags, hintButton.dataset.resourceTypeTagPart);
              if (!resourceTags || resourceTags.length == 0) {
                  return;
              }
  
              const button = document.getElementById(hintButton.id);
              const hintsDiv = button.querySelector('.hints');
  
              // Create links from the resource tags
              const resourceLinks = resourceTags
                  .map(tag => {
                      const resource = tagToResourceTitleAndSlug(tag, hintButton.dataset.resourceSlug);
                      if (resource) {
                          const url = createResourceUrl(resource.slug);
                          return `<a href="${url}" target="_blank">${hintButton.dataset.linkPrefix} ${resource.title}</a>`;
                      }
                      return null;
                  })
                  .filter(link => link !== null);
  
              // Remove duplicates
              const uniqueResourceLinks = [...new Set(resourceLinks)];
  
              // Sort by title
              uniqueResourceLinks.sort((a, b) => a.localeCompare(b));
  
              // Update button visibility and content
              if (uniqueResourceLinks.length > 0) {
                  hintsDiv.innerHTML = uniqueResourceLinks.join('<br>');
                  button.classList.remove('hidden');
              }
          }
  
          const tags = `{{Tags}}`.split(" ");
          const tagBasedHintButtons = document.querySelectorAll(".hintBtn.tagBasedHintBtn");
          for (let i = 0; i < tagBasedHintButtons.length; i++) {
              setupTagBasedHintButton(tagBasedHintButtons[i])
          }
      })()
}
if (__ankingSide === 'back') {
  
    function getSummaryFor(word) {
      word = word.replace(/^[\.,\/#\!$%\^&\*;:{}=\-_`~() \'\s]+|[\.,\/#\!$%\^&\*;:{}=\-_`~()\'\s]+$/g, "");
      var pc = document.getElementById("popup-container");
      var hc = document.getElementById("hc");
      var tc = document.getElementById("tc");
      var ic = document.getElementById("ic");
      var imgelem = document.getElementById("popup-image");
      imgelem.src = "";
      var shortsum = "";
      
      fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + word)
      .then(function (response) { return response.json(); })
      .then(function (response) {
        shortsum = response.description;
        shortsum = shortsum.replace(/(Disambiguation.*)/g, "Disambiguation");
        tc.innerHTML = "<span id='hc'>" + capfl(shortsum) + "</span>" + "\n" + response.extract_html + "\n";
        tc.style.width = "420px";
        if (response.extract_html && !response.extract.endsWith("to:")) {
          pc.style.display = "block";
          document.getElementById("open-wiki-btn").href = response.content_urls.desktop.page;
        } else { 
          pc.style.display = "none"; 
        }
        if (!response.thumbnail.source || response.type === "disambiguation") {
          tc.style.width = "420px";
        } else { 
          tc.style.width = "300px"; imgelem.src = response.thumbnail.source; 
        }
      })
      .catch(function (error) { 
        console.log(error); 
      });
    }
    
    function closePopup(deselectAlso = false) {
      pcc.style.display = 'none';
      if (deselectAlso) { clearSelection(); }
    }
  
    var pcc = document.getElementById("popup-container");
    var prevSel = "";
    ankingAddEventListener('click', function () {
      var currentSelection = getSelectionText();
      if (currentSelection !== "") { prevSel = currentSelection; }
      if (currentSelection && !mustClickW) {
        getSummaryFor(currentSelection);
      } else { closePopup(); }
    });
  
    ankingAddEventListener('keyup', function (e) {
      if (e.key == "w") {
        if (pcc.style.display === "block") { closePopup(); } else { getSummaryFor(prevSel); }
      }
    });
  
    function getSelectionText() {
      var text = "";
      if (window.getSelection) {
        text = window.getSelection().toString();
      } else if (document.selection && document.selection.type != "Control") { text = document.selection.createRange().text; }
      return text;
    }
  
    function capfl(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
  
    function clearSelection() {
      if (window.getSelection) { window.getSelection().removeAllRanges(); }
      else if (document.selection) { document.selection.empty(); }
    }
    
    //CUSTOMIZATION
    //this is a variable controlling whether user must click the "w" key to open the popup.
    //if set to true: user must select text, then click the "w" key to open wikipedia popup. Clicking "w" key again will close the popup. 
    //if set to false: user only needs to select text. popup will open automatically. Clicking "w" is an alternative but not obligatory way of opening/closing the popup in this mode.
    //BELOW SET to true or to false. 
    var mustClickW = true;
    //END CUSTOMIZATION
}
if (__ankingSide === 'back') {
  
      if(document.querySelector("html").classList.contains("android")) {
          // Add a margin to the bottom of the card content so that the button doesn't
          // overlap the content.
          var container = document.querySelector('#qa');
          var button = document.querySelector('.ankihub-view-note');
          container.style.marginBottom = 2 * button.offsetHeight + "px";
      }
}
if (__ankingSide === 'back') {
  
  var userJs1 = window.revealNextCloze
  var userJs2 = undefined
  var userJs3 = undefined
  var userJs4 = undefined
  var userJs5 = undefined
  var userJs6 = undefined
  var userJs7 = undefined
  var userJs8 = undefined
}
if (__ankingSide === 'back') {
  
      // autoflip hides card in front template
      document.getElementById("qa").style.removeProperty("display")
}
if (__ankingSide === 'back') {
  
      (function() {
        window.toggleHintBtn = function(containerId, noScrolling=false) {
          const container = document.getElementById(containerId)
          const link = container.getElementsByTagName("a")[0]
          const button = container.getElementsByTagName("button")[0]
          const hint = container.getElementsByTagName("div")[0]
      
          if (hint.style.display == "none") {
            button.classList.add("expanded-button")
            hint.style.display = "block"
            link.style.display = "none"
            if (ScrollToButton && !noScrolling) {
              hint.scrollIntoView({
                behavior: "smooth", // "auto" for instant scrolling
                block: "start",
                inline: "nearest"
              });
            }
          } else {
            button.classList.remove("expanded-button")
            hint.style.display = "none"
            link.style.display = ""
          }
        }
  
        window.toggleNextButton = function(){
          // adapted from Hint Hotkey add-on
          var customEvent = document.createEvent('MouseEvents');
          customEvent.initEvent('click', false, true);
          var arr = document.getElementsByTagName('a');
          for (var i=0; i<arr.length; i++) {
            var el = arr[i];
            if (
              window.getComputedStyle(el).display === 'none' ||
              window.getComputedStyle(el.parentElement).display === 'none'
            ) {
              continue;
            }
            if (el.classList.contains("hint")) {
              el.dispatchEvent(customEvent);
              break
            }
          }
        }
          
        const isToggleNextShortcut = shortcutMatcher(ToggleNextButtonShortcut)
        ankingAddEventListener("keydown", (evt) => {
          if (evt.repeat) return
          if (isToggleNextShortcut(evt)) {
            toggleNextButton()
          }
        })
      
        const setupHintBtn = function(elem) {
          const containerId = elem.id
          const fieldName = elem.dataset.name
          const button = elem.getElementsByClassName("button")[0]
          const tag = `autoopen::${fieldName.toLowerCase().replace(' ', '_')}`
          if (ButtonAutoReveal[fieldName] || (globalThis.tagList && globalThis.tagList.includes(tag))) {
            toggleHintBtn(containerId, noScrolling=true)
          }
      
          const isShortcut = shortcutMatcher(ButtonShortcuts[fieldName])
          const isToggleAllShortcut = shortcutMatcher(ToggleAllButtonsShortcut)
          ankingAddEventListener("keydown", (evt) => {
            if (evt.repeat) return
            if (isShortcut(evt) || isToggleAllShortcut(evt)) {
              toggleHintBtn(containerId)
            }
          })
        }
      
        const hints = document.getElementsByClassName("hintBtn")
        for (let i = 0; i < hints.length; i++) {
          setupHintBtn(hints[i])
        }
      })()
      
}
if (__ankingSide === 'back') {
  
    (function() {
      // enables cloze one-by-one even when one-by-one field is empty
      // minNumberOfClozes is still considered in this case
      // overridden in importance by selectiveOneByOne
      var alwaysOneByOne = false;
      var clozeOneByOneEnabled = true;
      var oneByOneField = document.getElementById("one-by-one");`r`n  if (!oneByOneField) {`r`n    Persistence.setItem("clozeHints", []);`r`n    return;`r`n  }`r`n  var oneByOneFieldNotEmpty = oneByOneField.textContent !== "";
        clozeOneByOneEnabled = alwaysOneByOne || oneByOneFieldNotEmpty;
  
      // --- CHECK IF ONE BY ONE SHOULD BE ENABLED FOR THIS SPECIFIC CARD ---
      /**
       * Credit for the getCardNumber function goes to foenixx (GitHub) / ollevolle (AnkiWeb Forum)
       */
      const getCardNumber = function () {
        clz = document.body.className;
        const regex = /card(\d+)/gm;
        let m;
  
        if ((m = regex.exec(clz)) !== null) {
          return m[1];
        } else {
          // Should only fire if card is not cloze
          console.error("Cannot find cardN class of body element!");
          return "0";
        }
      }
  
      // parse the cloze numbers for which selectiveOneByOne is enabled
      var clozeNumbers = oneByOneField.textContent.split(',').filter(element => element).map(Number)
      var cardNumberIsOneByOne = !clozeNumbers.filter(n => !Number.isNaN(n)).length || clozeNumbers.includes(parseInt(getCardNumber()))
  
      // check the amount of clozes -> disable OneByOne if less than minimum value wanted (minNumberOfClozes)
      var numClozesForNumber = (minNumberOfClozes) ? document.querySelectorAll('.clozefield .cloze').length : 0
  
      // stop OneByOne if selectiveOneByOne is not enabled for this specific card OR if OneByOne is disabled some other way
      // -> show normal backside
      if (!alwaysOneByOne && ((selectiveOneByOne && !cardNumberIsOneByOne) || (oneByOneFieldNotEmpty && (numClozesForNumber < minNumberOfClozes)))) {
        clozeOneByOneEnabled = false
      }
  
      if (!clozeOneByOneEnabled) {
        return
      }
  
      // Needed for amboss to recognize first word in .cloze-hidden
      const CLOZE_REPLACER_SEP = "<span class='hidden'> </span>"
  
      const hideAllCloze = function(initial) {
        let clozes = document.getElementsByClassName("cloze")
        let count = 0 // hidden cloze count
        for (const cloze of clozes) {
          const existingHidden = cloze.getElementsByClassName("cloze-hidden")[0]
          if (existingHidden) {
            revealCloze(cloze);
          }
          if (cloze.offsetWidth === 0) {
            continue
          }
          const clozeReplacer = document.createElement("span")
          const clozeHidden = document.createElement("span")
          clozeReplacer.classList.add("cloze-replacer")
          clozeHidden.classList.add("cloze-hidden")
          while (cloze.childNodes.length > 0) {
            clozeHidden.appendChild(cloze.childNodes[0])
          }
          cloze.appendChild(clozeReplacer)
          cloze.appendChild(clozeHidden)
  
          var clozeHints = Persistence.getItem("clozeHints");
          if (clozeHints && clozeHints[count]) {
            clozeReplacer.classList.add("cloze-hint")
            clozeReplacer.innerHTML = clozeHints[count] + CLOZE_REPLACER_SEP
          } else {
            clozeReplacer.innerHTML = clozeHider(cloze) + CLOZE_REPLACER_SEP
          }
          count += 1
          if (initial) {
            cloze.addEventListener("touchend", revealClozeClicked)
            cloze.addEventListener("click", revealClozeClicked)
            cloze.classList.add("one-by-one");
          }
        }
        const extra = document.getElementById("extra");
        if (extra) {
          extra.classList.add("hidden");
        }
        for (const [field, autoReveal] of Object.entries(ButtonAutoReveal)) {
          const container = document.querySelector(`[data-name="${field}"]`)
            if (container) {
              const tag = `autoopen::${field.toLowerCase().replace(' ', '_')}`
              if (autoReveal || (globalThis.tagList && globalThis.tagList.includes(tag))) {
                const link = container.getElementsByTagName("a")[0]
                const button = container.getElementsByTagName("button")[0]
                const hint = container.getElementsByTagName("div")[0]
                button.classList.remove("expanded-button")
                hint.style.display = "none"
                link.style.display = ""
            }
          }
        }
      }
      
      const revealCloze = function(cloze) {
        const clozeReplacer = cloze.getElementsByClassName("cloze-replacer")[0]
        const clozeHidden = cloze.getElementsByClassName("cloze-hidden")[0]
        if (!clozeReplacer || !clozeHidden) return;
  
        cloze.removeChild(clozeReplacer)
        cloze.removeChild(clozeHidden)
        while (clozeHidden.childNodes.length > 0) {
          cloze.appendChild(clozeHidden.childNodes[0])
        }
        maybeRevealExtraField()
      }
  
      const revealClozeWord = function(cloze) {
        const clozeReplacer = cloze.getElementsByClassName("cloze-replacer")[0]
        const clozeHidden = cloze.getElementsByClassName("cloze-hidden")[0]
        if (!clozeReplacer || !clozeHidden) return;
  
        let range = new Range()
        range.setStart(clozeHidden, 0)
        const foundSpace = setRangeEnd(range, clozeHidden, "beforeFirstSpace")
        if (!foundSpace) {
          range.setEnd(clozeHidden, clozeHidden.childNodes.length)
        }
        let fragment = range.extractContents()
        cloze.insertBefore(fragment, clozeReplacer)
        // Extract whitespaces after word
        range = new Range()
        range.setStart(clozeHidden, 0)
        const foundWord = setRangeEnd(range, clozeHidden, "beforeFirstChar")
        if (!foundWord) {
          range.setEnd(clozeHidden, clozeHidden.childNodes.length)
        }    
        fragment = range.extractContents();
        cloze.insertBefore(fragment, clozeReplacer)
        if (!foundWord) {
          cloze.removeChild(clozeHidden)
          cloze.removeChild(clozeReplacer)
          maybeRevealExtraField()
          return
        }
        clozeReplacer.innerHTML = clozeHider(clozeHidden) + CLOZE_REPLACER_SEP
        if (clozeReplacer.classList.contains("cloze-hint")) [
          clozeReplacer.classList.remove("cloze-hint")
        ]
        maybeRevealExtraField()
      }
  
      const revealNextClozeOf = (type) => {
        const nextHidden = document.querySelector(".cloze-hidden")
        if(!nextHidden) {
            return
        } 
        const cloze = clozeElOfClozeHidden(nextHidden);
        if (type === "word") {
            revealClozeWord(cloze)
        } else if (type === "cloze") {
            revealCloze(cloze)
        } else {
          console.error("Invalid type: " + type)
        }
      }
  
      const revealClozeClicked = function(ev) {
        let elem = ev.currentTarget
        if (!ev.altKey && (revealNextClozeMode !== "word")) {
          revealCloze(elem)
        } else {
          revealClozeWord(elem)
        }
        ev.stopPropagation()
        ev.preventDefault()
      }
  
      window.revealNextCloze = function() {
        revealNextClozeOf(revealNextClozeMode)
      }
  
      window.toggleAllCloze = function() {
        let elems = document.querySelectorAll(".cloze-hidden")
        if(elems.length > 0) {
          for (const elem of elems) {
            const cloze = clozeElOfClozeHidden(elem)
            revealCloze(cloze)
          }
        } else {
          hideAllCloze(initial=false)
        }
      }
  
      const clozeElOfClozeHidden = (cloze) => {
        while (!cloze.classList.contains("cloze")) {
          cloze = cloze.parentElement;
        }
        return cloze;
      }
  
      const maybeRevealExtraField = () => {
        let elems = document.querySelectorAll(".cloze-hidden")
        if (elems.length == 0) {
          const extra = document.getElementById("extra")
          if (extra) {
            extra.classList.remove("hidden")
          }
          // Also reveal autoReveal fields
          for (const [field, autoReveal] of Object.entries(ButtonAutoReveal)) {
            const container = document.querySelector(`[data-name="${field}"]`)
            if (container) {
              const tag = `autoopen::${field.toLowerCase().replace(' ', '_')}`
              if (autoReveal || (globalThis.tagList && globalThis.tagList.includes(tag))) {
                const link = container.getElementsByTagName("a")[0]
                const button = container.getElementsByTagName("button")[0]
                const hint = container.getElementsByTagName("div")[0]
                button.classList.add("expanded-button")
                hint.style.display = "block"
                link.style.display = "none"
              }
            }
          }
        }
      }
  
      /**
       * mode: 'beforeFirstSpace' or 'beforeFirstChar'
       * Return `true` if it exists and setEnd() was called, otherwise `false`
       */
      const setRangeEnd = function(range, node, mode) {
        if (node.nodeType === Node.TEXT_NODE) {
          const regex = mode === 'beforeFirstSpace' ? /\s/ : /\S/
          const match = node.textContent.match(regex)
          if (match) {
            if (match.index === 0) {
              while (node.previousSibling === null) {
                node = node.parentElement
              }
              range.setEndBefore(node)
            } else {
              range.setEnd(node, match.index);
            }
            return true;
          } else {
            return false;
          }
        } else if (mode === 'beforeFirstChar' && isCharNode(node)) {
          range.setEndBefore(node)
          return true
        } else if (!ignoreSpaceInNode(node)) {
          for (const child of node.childNodes) {
            if (setRangeEnd(range, child, mode)) {
              return true;
            }
          }
          return false;
        }
      }
  
      const ignoreSpaceInNode = function (node) {
        return node.tagName === "MJX-ASSISTIVE-MML"
      }
  
      const isCharNode = function(node) {
        return ["IMG", "MJX-CONTAINER"].includes(node.tagName)
      }
  
      hideAllCloze(initial=true)
  
      let isShowNextShortcut = shortcutMatcher(window.revealNextShortcut)
      let isShowWordShortcut = shortcutMatcher(window.revealNextWordShortcut)
      let isToggleAllShortcut = shortcutMatcher(window.toggleAllShortcut)
      ankingAddEventListener("keydown", (ev) => {
        let next = isShowNextShortcut(ev)
        let word = isShowWordShortcut(ev)
        let all = isToggleAllShortcut(ev)
        if (next) {
          revealNextClozeOf("cloze")
        } else if (word) {
          revealNextClozeOf("word")
        } else if (all) {
          toggleAllCloze()
        } else {
          return;
        }
        ev.stopPropagation()
        ev.preventDefault()
      });
    })()
}
if (__ankingSide === 'back') {
  const oneByOneField = document.getElementById("one-by-one");
  const buttons = document.getElementById("1by1-btns");
  if (oneByOneField && buttons && oneByOneField.textContent.trim() !== "") {
    buttons.style.display = "block";
  }
}





