import { readFileSync } from "node:fs";

const GITHUB_API = "https://api.github.com";

function normalizeLanguage(value) {
  return String(value).trim().toLowerCase();
}

const HIDDEN_LANGUAGES = [
  "HTML",
  "CSS",
  "SCSS",
  "Less",
  "Blade",
  "Dockerfile",
  "Shell",
  "Batchfile",
  "PowerShell",
  "Makefile",
];

const LANGUAGE_COLORS = {
  Astro: "#ff5a03",
  Batchfile: "#c1f12e",
  C: "#555555",
  "C#": "#178600",
  "C++": "#f34b7d",
  CSS: "#563d7c",
  Dart: "#00B4AB",
  Dockerfile: "#384d54",
  Elixir: "#6e4a7e",
  Go: "#00add8",
  HTML: "#e34c26",
  Java: "#b07219",
  JavaScript: "#f1e05a",
  JSON: "#292929",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
  Kotlin: "#A97BFF",
  Less: "#1d365d",
  Lua: "#000080",
  Markdown: "#083fa1",
  PHP: "#4F5D95",
  PowerShell: "#012456",
  Python: "#3572A5",
  Ruby: "#701516",
  Rust: "#dea584",
  SCSS: "#c6538c",
  Shell: "#89e051",
  SQL: "#e38c00",
  Svelte: "#ff3e00",
  Swift: "#F05138",
  TSX: "#3178c6",
  TypeScript: "#3178c6",
  Vue: "#41b883",
  YAML: "#cb171e",
};

const LANGUAGE_COLORS_BY_NAME = Object.fromEntries(
  Object.entries(LANGUAGE_COLORS).map(([language, color]) => [
    normalizeLanguage(language),
    color,
  ]),
);

const AZONIX_FONT_BASE64 = readFileSync(
  new URL("../fonts/Azonix.otf", import.meta.url),
).toString("base64");

const SVG_FONT_FAMILY = "Azonix";
const SVG_FONT_STACK = `'${SVG_FONT_FAMILY}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;
const SVG_FONT_FACE_CSS = `
@font-face {
  font-family: '${SVG_FONT_FAMILY}';
  src: url(data:font/otf;base64,${AZONIX_FONT_BASE64}) format('opentype');
  font-style: normal;
  font-weight: 400;
}
`.trim();

const DEFAULT_THEME = "red";

const THEME_VARIANTS = {
  red: {
    accent: "#c4323d",
    glow: "#7d1118",
    neutralSet: "warm",
    cardTint: 0.1,
    beamAlpha: 0.42,
    languageTint: 0.18,
    shadowGlowAlpha: 0.05,
  },
  blue: {
    accent: "#3376d2",
    glow: "#163f84",
    neutralSet: "cool",
    cardTint: 0.08,
    beamAlpha: 0.4,
    languageTint: 0.15,
    shadowGlowAlpha: 0.045,
  },
  yellow: {
    accent: "#c79a30",
    glow: "#7b5a12",
    neutralSet: "warm",
    cardTint: 0.08,
    beamAlpha: 0.36,
    languageTint: 0.12,
    shadowGlowAlpha: 0.04,
  },
  purple: {
    accent: "#7a52d0",
    glow: "#4c2c86",
    neutralSet: "cool",
    cardTint: 0.08,
    beamAlpha: 0.41,
    languageTint: 0.16,
    shadowGlowAlpha: 0.045,
  },
  green: {
    accent: "#309559",
    glow: "#1b6237",
    neutralSet: "cool",
    cardTint: 0.07,
    beamAlpha: 0.37,
    languageTint: 0.14,
    shadowGlowAlpha: 0.04,
  },
  white: {
    accent: "#dce2e8",
    glow: "#8996a4",
    neutralSet: "cool",
    cardTint: 0.04,
    beamAlpha: 0.28,
    languageTint: 0.08,
    shadowGlowAlpha: 0.03,
  },
};

const THEME_NEUTRALS = {
  warm: {
    cardFillStart: "#0f0c0d",
    cardFillMid: "#090708",
    cardFillEnd: "#060506",
    shadowBase: "#050405",
    title: "#f4ece9",
    label: "#f4ece9",
    subtitle: "#b39f9a",
    metric: "#b9aaa6",
    eyebrow: "#c9a7a1",
    badge: "#d6beb7",
    emptyTitle: "#f5ece8",
  },
  cool: {
    cardFillStart: "#0d0f11",
    cardFillMid: "#08090a",
    cardFillEnd: "#050506",
    shadowBase: "#040506",
    title: "#eef2f6",
    label: "#eef2f6",
    subtitle: "#b6bec8",
    metric: "#bec7d0",
    eyebrow: "#d4dce4",
    badge: "#dde3ea",
    emptyTitle: "#eef2f6",
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Number(value.toFixed(2));
}

function scaleValue(input, inputMin, inputMax, outputMin, outputMax) {
  if (input <= inputMin) {
    return outputMin;
  }

  if (input >= inputMax) {
    return outputMax;
  }

  const progress = (input - inputMin) / (inputMax - inputMin);
  return outputMin + (outputMax - outputMin) * progress;
}

function getQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

function parseIntegerParam(value, defaultValue, min, max) {
  const parsed = Number.parseInt(String(getQueryValue(value)).trim(), 10);

  if (!Number.isFinite(parsed)) {
    return defaultValue;
  }

  return clamp(parsed, min, max);
}

function parseBooleanParam(value) {
  const normalized = String(getQueryValue(value)).trim().toLowerCase();
  return normalized === "true" || normalized === "1";
}

function parseThemeParam(value) {
  const normalized = normalizeLanguage(getQueryValue(value));

  if (!normalized) {
    return DEFAULT_THEME;
  }

  return Object.prototype.hasOwnProperty.call(THEME_VARIANTS, normalized)
    ? normalized
    : DEFAULT_THEME;
}

function getColor(language) {
  return LANGUAGE_COLORS_BY_NAME[normalizeLanguage(language)] || "#b29b96";
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function truncateText(value, maxLength) {
  const text = String(value);

  if (text.length <= maxLength) {
    return text;
  }

  if (maxLength <= 3) {
    return text.slice(0, maxLength);
  }

  return `${text.slice(0, maxLength - 3)}...`;
}

function wrapText(value, maxChars, maxLines = 2) {
  const text = String(value).trim();

  if (!text) {
    return [];
  }

  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length <= maxChars) {
      currentLine = nextLine;
      continue;
    }

    if (!currentLine) {
      currentLine = truncateText(word, maxChars);
    }

    lines.push(currentLine);

    if (lines.length === maxLines - 1) {
      const remaining = words.slice(index).join(" ");
      lines.push(truncateText(remaining, maxChars));
      return lines;
    }

    currentLine = word.length > maxChars ? truncateText(word, maxChars) : word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, maxLines);
}

function estimateCharCapacity(availableWidth, fontSize, factor = 0.57) {
  return Math.max(4, Math.floor(availableWidth / (fontSize * factor)));
}

function getGlyphWidthFactor(character) {
  if (character === " ") {
    return 0.36;
  }

  if (/[.,:;!|]/.test(character)) {
    return 0.28;
  }

  if (/[-_/\\()[\]{}]/.test(character)) {
    return 0.42;
  }

  if (character === "@") {
    return 0.92;
  }

  if (/[MW]/.test(character)) {
    return 1.02;
  }

  if (/[A-Z]/.test(character)) {
    return 0.84;
  }

  if (/[mw]/.test(character)) {
    return 0.9;
  }

  if (/[iljtfr]/.test(character)) {
    return 0.5;
  }

  if (/\d/.test(character)) {
    return 0.72;
  }

  return 0.72;
}

function estimateTextWidth(value, fontSize, factor = 0.88) {
  return Array.from(String(value)).reduce(
    (total, character) =>
      total + fontSize * factor * getGlyphWidthFactor(character),
    0,
  );
}

function truncateTextToWidth(value, maxWidth, fontSize, factor = 0.88) {
  const text = String(value);

  if (estimateTextWidth(text, fontSize, factor) <= maxWidth) {
    return text;
  }

  const ellipsis = "...";
  const ellipsisWidth = estimateTextWidth(ellipsis, fontSize, factor);

  if (ellipsisWidth >= maxWidth) {
    return ellipsis;
  }

  let output = "";

  for (const character of text) {
    const nextValue = `${output}${character}`;

    if (estimateTextWidth(nextValue, fontSize, factor) + ellipsisWidth > maxWidth) {
      break;
    }

    output = nextValue;
  }

  return output ? `${output}${ellipsis}` : ellipsis;
}

function hexToRgb(hex) {
  const normalized = String(hex).replace("#", "").trim();
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => `${part}${part}`)
          .join("")
      : normalized;

  if (!/^[\da-fA-F]{6}$/.test(expanded)) {
    return null;
  }

  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

function mixHexColors(baseHex, mixHex, weight) {
  const base = hexToRgb(baseHex);
  const mix = hexToRgb(mixHex);

  if (!base || !mix) {
    return baseHex;
  }

  const ratio = clamp(weight, 0, 1);
  const toHex = (value) =>
    Math.round(value).toString(16).padStart(2, "0");

  return `#${toHex(base.r + (mix.r - base.r) * ratio)}${toHex(base.g + (mix.g - base.g) * ratio)}${toHex(base.b + (mix.b - base.b) * ratio)}`;
}

function toRgba(hex, alpha) {
  const color = hexToRgb(hex);

  if (!color) {
    return `rgba(255, 255, 255, ${round(alpha)})`;
  }

  return `rgba(${color.r}, ${color.g}, ${color.b}, ${round(alpha)})`;
}

function buildThemePalette(themeName) {
  const variant = THEME_VARIANTS[themeName] || THEME_VARIANTS[DEFAULT_THEME];
  const neutrals = THEME_NEUTRALS[variant.neutralSet] || THEME_NEUTRALS.warm;
  const accent = variant.accent;
  const glow = variant.glow;
  const accentDeep = mixHexColors(accent, "#000000", 0.38);
  const accentLift = mixHexColors(accent, "#ffffff", 0.14);
  const accentMuted = mixHexColors(accent, "#1a1517", 0.72);
  const textTint = variant.neutralSet === "cool" ? 0.08 : 0.05;
  const subtitleTint = variant.neutralSet === "cool" ? 0.14 : 0.1;

  return {
    name: themeName,
    accent,
    accentDeep,
    accentLift,
    accentMuted,
    languageTint: variant.languageTint,
    cardFillStart: mixHexColors(neutrals.cardFillStart, accent, variant.cardTint),
    cardFillMid: mixHexColors(neutrals.cardFillMid, accentDeep, variant.cardTint * 0.62),
    cardFillEnd: mixHexColors(neutrals.cardFillEnd, accentDeep, variant.cardTint * 0.34),
    shadowBase: toRgba(neutrals.shadowBase, 0.34),
    shadowAccent: toRgba(glow, variant.shadowGlowAlpha),
    ambientInner: toRgba(glow, 0.2),
    ambientMid: toRgba(accentDeep, 0.1),
    ambientOuter: toRgba(accentDeep, 0),
    borderStart: mixHexColors("#3a2a2f", accent, 0.28),
    borderMid: mixHexColors("#251b1e", accentMuted, 0.22),
    borderEnd: mixHexColors("#1a1315", accentDeep, 0.16),
    innerStroke: toRgba(mixHexColors("#ffffff", accent, 0.06), 0.05),
    topBeamAccent: toRgba(accent, variant.beamAlpha),
    trackFillStart: mixHexColors("#181214", accent, 0.08),
    trackFillEnd: mixHexColors("#241a1d", accentDeep, 0.14),
    trackStroke: toRgba(mixHexColors("#ffffff", accent, 0.15), 0.06),
    emptyStateFillStart: mixHexColors("#110d0f", accent, 0.08),
    emptyStateFillEnd: mixHexColors("#090708", accentDeep, 0.06),
    emptyStateBorder: mixHexColors("#2f2326", accent, 0.24),
    badgeFill: mixHexColors("#151113", accent, 0.14),
    badgeStroke: mixHexColors("#40272c", accent, 0.34),
    title: mixHexColors(neutrals.title, accentLift, textTint * 0.6),
    label: mixHexColors(neutrals.label, accentLift, textTint),
    subtitle: mixHexColors(neutrals.subtitle, accentLift, subtitleTint),
    metric: mixHexColors(neutrals.metric, accentLift, subtitleTint),
    eyebrow: mixHexColors(neutrals.eyebrow, accentLift, 0.16),
    badgeText: mixHexColors(neutrals.badge, accentLift, 0.14),
    emptyTitle: mixHexColors(neutrals.emptyTitle, accentLift, 0.08),
    bgWave: toRgba(accentDeep, 0.13),
    shardStart: toRgba(accent, 0.22),
    shardMid: toRgba(accentDeep, 0.14),
    shardInner: toRgba(accentLift, 0.07),
    shardLine: toRgba(mixHexColors("#ffffff", accent, 0.18), 0.07),
    rowDotStroke: toRgba(mixHexColors("#ffffff", accent, 0.18), 0.16),
    barHighlight: toRgba(mixHexColors("#ffffff", accent, 0.12), 0.24),
  };
}

function formatPercentage(value) {
  return `${value
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1")}%`;
}

function buildHiddenLanguageSet(rawHide) {
  const queryLanguages = String(getQueryValue(rawHide))
    .split(",")
    .map((language) => normalizeLanguage(language))
    .filter(Boolean);

  return new Set([
    ...HIDDEN_LANGUAGES.map((language) => normalizeLanguage(language)),
    ...queryLanguages,
  ]);
}

function buildState(stateKey, statusCode) {
  if (stateKey === "missing-username") {
    return {
      badge: "INPUT REQUIRED",
      title: "No username provided",
      message: "Add ?username=your-github-handle to generate this card.",
    };
  }

  if (stateKey === "empty-languages") {
    return {
      badge: "NO VISIBLE DATA",
      title: "No visible languages",
      message:
        "All detected languages were filtered out or no public code was found.",
    };
  }

  if (stateKey === "error") {
    return {
      badge: "GENERATION ERROR",
      title: "Unable to build card",
      message: "The generator failed before the SVG could be completed.",
    };
  }

  return {
    badge: statusCode === 404 ? "PROFILE NOT FOUND" : "GITHUB UNAVAILABLE",
    title: statusCode === 404 ? "Profile unavailable" : "GitHub request failed",
    message:
      statusCode === 404
        ? "No public GitHub profile matched this username."
        : `GitHub returned status ${statusCode} while loading repositories.`,
  };
}

function getCardLayout(width, visibleCount) {
  const outerInset = round(scaleValue(width, 280, 560, 10, 14));
  const cardX = outerInset;
  const cardY = outerInset;
  const cardWidth = width - outerInset * 2;
  const contentInsetX = round(scaleValue(width, 280, 560, 18, 28));
  const contentLeft = cardX + contentInsetX;
  const contentRight = cardX + cardWidth - contentInsetX;
  const contentWidth = contentRight - contentLeft;
  const eyebrowSize = round(scaleValue(width, 280, 560, 8.8, 10.4));
  const titleSize = round(scaleValue(width, 280, 560, 18.5, 23.5));
  const subtitleSize = round(scaleValue(width, 280, 560, 9.4, 11));
  const labelSize = round(scaleValue(width, 280, 560, 10.8, 12.8));
  const percentageSize = round(scaleValue(width, 280, 560, 10.2, 11.8));
  const topInset = round(scaleValue(width, 280, 560, 18, 22));
  const eyebrowY = cardY + topInset + eyebrowSize;
  const titleY = eyebrowY + round(scaleValue(width, 280, 560, 20, 23));
  const subtitleY = titleY + round(scaleValue(width, 280, 560, 18, 20));
  const dividerY = subtitleY + round(scaleValue(width, 280, 560, 16, 18));
  const rowsStartY = dividerY + round(scaleValue(width, 280, 560, 14, 18));
  const dotRadius = round(scaleValue(width, 280, 560, 3.8, 4.6));
  const rowBaselineY = round(scaleValue(width, 280, 560, 6.4, 7.2));
  const rowStep = round(scaleValue(width, 280, 560, 34, 39));
  const trackY = round(scaleValue(width, 280, 560, 15.5, 17.5));
  const trackHeight = round(scaleValue(width, 280, 560, 5.2, 6.2));
  const trackRadius = round(trackHeight / 2);
  const labelX = round(dotRadius * 2 + scaleValue(width, 280, 560, 7, 9));
  const percentageReserve = round(scaleValue(width, 280, 560, 56, 74));
  const labelRight = contentWidth - percentageReserve;
  const labelMaxWidth = labelRight - labelX;
  const trackX = labelX;
  const trackWidth = contentWidth - trackX;
  const rowVisualHeight = trackY + trackHeight;
  const bottomInset = round(scaleValue(width, 280, 560, 18, 22));
  const emptyPanelHeight = round(scaleValue(width, 280, 560, 94, 108));
  const rowsHeight =
    visibleCount > 0
      ? (visibleCount - 1) * rowStep + rowVisualHeight
      : emptyPanelHeight;
  const cardBottom = rowsStartY + rowsHeight + bottomInset;
  const height = Math.ceil(cardBottom + outerInset);
  const cardHeight = height - outerInset * 2;
  const cardRadius = round(scaleValue(width, 280, 560, 18, 22));
  const decorationWidth = round(scaleValue(width, 280, 560, 72, 112));
  const decorationHeight = round(scaleValue(width, 280, 560, 64, 92));
  const decorationX = contentRight - decorationWidth + round(scaleValue(width, 280, 560, 8, 6));
  const decorationY = cardY + round(scaleValue(width, 280, 560, 12, 18));

  return {
    outerInset,
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    cardRadius,
    contentLeft,
    contentRight,
    contentWidth,
    eyebrowSize,
    titleSize,
    subtitleSize,
    labelSize,
    percentageSize,
    eyebrowY,
    titleY,
    subtitleY,
    dividerY,
    rowsStartY,
    dotRadius,
    rowBaselineY,
    rowStep,
    trackY,
    trackHeight,
    trackRadius,
    labelX,
    labelMaxWidth,
    trackX,
    trackWidth,
    percentageX: contentWidth,
    bottomInset,
    emptyPanelHeight,
    height,
    decorationX,
    decorationY,
    decorationWidth,
    decorationHeight,
  };
}

function buildBarGradientDefs(languages, theme) {
  return languages
    .map((item, index) => {
      const color = getColor(item.language);
      const themedBase = mixHexColors(color, theme.accent, theme.languageTint);
      const start = mixHexColors(themedBase, "#ffffff", 0.14);
      const end = mixHexColors(themedBase, theme.accentDeep, 0.18);

      return `
    <linearGradient id="barGradient${index}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${start}"/>
      <stop offset="55%" stop-color="${themedBase}"/>
      <stop offset="100%" stop-color="${end}"/>
    </linearGradient>
  `.trim();
    })
    .join("\n");
}

function buildRowSvg({ item, index, layout, disableAnimations, theme }) {
  const color = getColor(item.language);
  const percentageLabel = formatPercentage(item.percentage);
  const renderedBarWidth =
    item.percentage > 0
      ? Math.max(
          layout.trackHeight,
          Number(((item.percentage / 100) * layout.trackWidth).toFixed(2)),
        )
      : 0;
  const labelMaxChars = estimateCharCapacity(
    layout.labelMaxWidth,
    layout.labelSize,
    0.86,
  );
  const label = truncateText(item.language, labelMaxChars);
  const beginMs = 110 + index * 70;
  const fillBeginMs = beginMs + 90;
  const rowTop = round(layout.rowsStartY + index * layout.rowStep);
  const dotCx = layout.dotRadius;
  const highlightWidth = renderedBarWidth > 0 ? Math.max(0, renderedBarWidth - 1.2) : 0;
  const openGroup = disableAnimations
    ? `<g transform="translate(${layout.contentLeft} ${rowTop})">`
    : `<g transform="translate(${layout.contentLeft} ${rowTop})" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="360ms" begin="${beginMs}ms" fill="freeze"/>
      `;

  const fillRect = disableAnimations
    ? `<rect x="${layout.trackX}" y="${layout.trackY}" width="${renderedBarWidth}" height="${layout.trackHeight}" rx="${layout.trackRadius}" fill="url(#barGradient${index})"/>`
    : `<rect x="${layout.trackX}" y="${layout.trackY}" width="0" height="${layout.trackHeight}" rx="${layout.trackRadius}" fill="url(#barGradient${index})">
        <animate attributeName="width" from="0" to="${renderedBarWidth}" dur="680ms" begin="${fillBeginMs}ms" fill="freeze"/>
      </rect>`;

  return `
      ${openGroup}
        <circle cx="${dotCx}" cy="${layout.rowBaselineY}" r="${layout.dotRadius}" fill="${color}" stroke="${theme.rowDotStroke}" stroke-width="0.9"/>
        <text x="${layout.labelX}" y="${layout.rowBaselineY}" fill="${theme.label}" font-size="${layout.labelSize}" font-weight="600" font-family="${SVG_FONT_STACK}" dominant-baseline="middle">
          ${escapeXml(label)}
        </text>
        <text x="${layout.percentageX}" y="${layout.rowBaselineY}" fill="${theme.metric}" font-size="${layout.percentageSize}" font-weight="500" font-family="${SVG_FONT_STACK}" text-anchor="end" dominant-baseline="middle" font-variant-numeric="tabular-nums">
          ${percentageLabel}
        </text>
        <rect x="${layout.trackX}" y="${layout.trackY}" width="${layout.trackWidth}" height="${layout.trackHeight}" rx="${layout.trackRadius}" fill="url(#trackFill)" stroke="${theme.trackStroke}" stroke-width="0.8"/>
        ${fillRect}
        ${highlightWidth > 0 ? `<rect x="${layout.trackX + 0.6}" y="${layout.trackY + 0.7}" width="${highlightWidth}" height="${Math.max(1.2, layout.trackHeight * 0.34)}" rx="${Math.max(0.6, layout.trackRadius - 0.6)}" fill="${theme.barHighlight}"/>` : ""}
      </g>
    `.trim();
}

function createSvg({
  username,
  languages,
  langsCount,
  cardWidth,
  disableAnimations,
  state,
  themeName = DEFAULT_THEME,
}) {
  const visibleLanguages = languages.slice(0, langsCount);
  const width = cardWidth;
  const layout = getCardLayout(width, visibleLanguages.length);
  const theme = buildThemePalette(themeName);
  const subtitleLabel = truncateTextToWidth(
    username
      ? `GitHub code distribution for @${username}`
      : "GitHub code distribution for your profile",
    layout.contentWidth - round(scaleValue(width, 280, 560, 10, 14)),
    layout.subtitleSize,
    1.18,
  );
  const badgeWidth = Math.min(
    layout.contentWidth - 32,
    Math.max(104, Math.round(state.badge.length * 6.1 + 26)),
  );
  const messageLines = wrapText(
    state.message,
    estimateCharCapacity(layout.contentWidth - 32, layout.subtitleSize, 1.02),
    2,
  );
  const title = username
    ? `Most used languages for ${username}`
    : "Most used languages card";
  const description =
    visibleLanguages.length > 0
      ? `Top ${visibleLanguages.length} languages sorted by repository byte count.`
      : state.message;

  const barGradientDefs = buildBarGradientDefs(visibleLanguages, theme);
  const rows = visibleLanguages
    .map((item, index) =>
      buildRowSvg({
        item,
        index,
        layout,
        disableAnimations,
        theme,
      }),
    )
    .join("\n");

  const emptyStateBlock =
    visibleLanguages.length > 0
      ? ""
      : `
    <g transform="translate(${layout.contentLeft} ${layout.rowsStartY + 2})">
      <rect width="${layout.contentWidth}" height="${layout.emptyPanelHeight}" rx="18" fill="url(#emptyStateFill)" stroke="${theme.emptyStateBorder}"/>
      <rect x="16" y="16" width="${badgeWidth}" height="22" rx="999" fill="${theme.badgeFill}" stroke="${theme.badgeStroke}"/>
      <text x="30" y="31" fill="${theme.badgeText}" font-size="9.5" font-weight="700" font-family="${SVG_FONT_STACK}" letter-spacing="0.12em">
        ${escapeXml(state.badge)}
      </text>
      <text x="16" y="58" fill="${theme.emptyTitle}" font-size="${layout.titleSize - 1}" font-weight="700" font-family="${SVG_FONT_STACK}">
        ${escapeXml(state.title)}
      </text>
      ${messageLines
        .map(
          (line, lineIndex) => `
      <text x="16" y="${78 + lineIndex * 16}" fill="${theme.subtitle}" font-size="${layout.subtitleSize}" font-family="${SVG_FONT_STACK}">
        ${escapeXml(line)}
      </text>`.trim(),
        )
        .join("\n")}
    </g>
  `.trim();

  return `
<svg width="${width}" height="${layout.height}" viewBox="0 0 ${width} ${layout.height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="cardTitle cardDesc" text-rendering="geometricPrecision" shape-rendering="geometricPrecision">
  <title id="cardTitle">${escapeXml(title)}</title>
  <desc id="cardDesc">${escapeXml(description)}</desc>
  <style>
    ${SVG_FONT_FACE_CSS}
  </style>
  <defs>
    <linearGradient id="cardFill" x1="${layout.cardX}" y1="${layout.cardY}" x2="${layout.cardX + layout.cardWidth}" y2="${layout.cardY + layout.cardHeight}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.cardFillStart}"/>
      <stop offset="52%" stop-color="${theme.cardFillMid}"/>
      <stop offset="100%" stop-color="${theme.cardFillEnd}"/>
    </linearGradient>
    <radialGradient id="ambientGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${layout.cardX + layout.cardWidth} ${layout.cardY + layout.cardHeight * 0.2}) rotate(145) scale(${layout.cardWidth * 0.72} ${layout.cardHeight * 0.85})">
      <stop offset="0%" stop-color="${theme.ambientInner}"/>
      <stop offset="42%" stop-color="${theme.ambientMid}"/>
      <stop offset="100%" stop-color="${theme.ambientOuter}"/>
    </radialGradient>
    <linearGradient id="innerBorder" x1="${layout.cardX}" y1="${layout.cardY}" x2="${layout.cardX + layout.cardWidth}" y2="${layout.cardY + layout.cardHeight}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.borderStart}"/>
      <stop offset="55%" stop-color="${theme.borderMid}"/>
      <stop offset="100%" stop-color="${theme.borderEnd}"/>
    </linearGradient>
    <linearGradient id="topBeam" x1="${layout.contentLeft}" y1="0" x2="${layout.contentRight}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0)"/>
      <stop offset="46%" stop-color="${theme.topBeamAccent}"/>
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0)"/>
    </linearGradient>
    <linearGradient id="trackFill" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.trackFillStart}"/>
      <stop offset="100%" stop-color="${theme.trackFillEnd}"/>
    </linearGradient>
    <linearGradient id="emptyStateFill" x1="0" y1="0" x2="${layout.contentWidth}" y2="${layout.emptyPanelHeight}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.emptyStateFillStart}"/>
      <stop offset="100%" stop-color="${theme.emptyStateFillEnd}"/>
    </linearGradient>
    <linearGradient id="shardFill" x1="${layout.decorationX}" y1="${layout.decorationY}" x2="${layout.decorationX + layout.decorationWidth}" y2="${layout.decorationY + layout.decorationHeight}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.shardStart}"/>
      <stop offset="58%" stop-color="${theme.shardMid}"/>
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0)"/>
    </linearGradient>
    <clipPath id="cardClip">
      <rect x="${layout.cardX}" y="${layout.cardY}" width="${layout.cardWidth}" height="${layout.cardHeight}" rx="${layout.cardRadius}"/>
    </clipPath>
    <clipPath id="headerClip">
      <rect x="${layout.contentLeft}" y="${layout.cardY}" width="${layout.contentWidth}" height="${layout.dividerY - layout.cardY + 2}" rx="0"/>
    </clipPath>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="${theme.shadowBase}"/>
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="${theme.shadowAccent}"/>
    </filter>
    ${barGradientDefs}
  </defs>

  <g filter="url(#cardShadow)">
    <rect x="${layout.cardX}" y="${layout.cardY}" width="${layout.cardWidth}" height="${layout.cardHeight}" rx="${layout.cardRadius}" fill="${mixHexColors(theme.cardFillEnd, "#000000", 0.28)}"/>
  </g>
  <g clip-path="url(#cardClip)">
    <rect x="${layout.cardX}" y="${layout.cardY}" width="${layout.cardWidth}" height="${layout.cardHeight}" rx="${layout.cardRadius}" fill="url(#cardFill)"/>
    <rect x="${layout.cardX}" y="${layout.cardY}" width="${layout.cardWidth}" height="${layout.cardHeight}" rx="${layout.cardRadius}" fill="url(#ambientGlow)"/>
    <path d="M${layout.cardX} ${layout.cardY + layout.cardHeight * 0.16}C${layout.cardX + layout.cardWidth * 0.38} ${layout.cardY + layout.cardHeight * 0.1} ${layout.cardX + layout.cardWidth * 0.72} ${layout.cardY + layout.cardHeight * 0.24} ${layout.cardX + layout.cardWidth} ${layout.cardY + layout.cardHeight * 0.12}V${layout.cardY}H${layout.cardX}Z" fill="${theme.bgWave}"/>

    <g opacity="0.58">
      <path d="M${layout.decorationX + 4} ${layout.decorationY + 6}L${layout.decorationX + layout.decorationWidth} ${layout.decorationY + 24}L${layout.decorationX + layout.decorationWidth - 26} ${layout.decorationY + layout.decorationHeight}L${layout.decorationX - 6} ${layout.decorationY + layout.decorationHeight - 18}Z" fill="url(#shardFill)"/>
      <path d="M${layout.decorationX + 24} ${layout.decorationY + 12}L${layout.decorationX + layout.decorationWidth - 18} ${layout.decorationY + 26}L${layout.decorationX + layout.decorationWidth - 34} ${layout.decorationY + layout.decorationHeight - 10}L${layout.decorationX + 12} ${layout.decorationY + layout.decorationHeight - 22}Z" fill="${theme.shardInner}"/>
      <path d="M${layout.decorationX + 10} ${layout.decorationY + layout.decorationHeight - 18}L${layout.decorationX + layout.decorationWidth - 26} ${layout.decorationY + layout.decorationHeight}" stroke="${theme.shardLine}"/>
    </g>

    <path d="M${layout.contentLeft} ${layout.cardY + 1.5}H${layout.contentRight}" stroke="url(#topBeam)" stroke-width="1.15" stroke-linecap="round"/>
  </g>

  <rect x="${layout.cardX}" y="${layout.cardY}" width="${layout.cardWidth}" height="${layout.cardHeight}" rx="${layout.cardRadius}" stroke="url(#innerBorder)"/>
  <rect x="${layout.cardX + 1}" y="${layout.cardY + 1}" width="${layout.cardWidth - 2}" height="${layout.cardHeight - 2}" rx="${Math.max(0, layout.cardRadius - 1)}" stroke="${theme.innerStroke}"/>

  <g clip-path="url(#headerClip)">
    <text x="${layout.contentLeft}" y="${layout.eyebrowY}" fill="${theme.eyebrow}" font-size="${layout.eyebrowSize}" font-weight="700" font-family="${SVG_FONT_STACK}" letter-spacing="0.18em">
      LANGUAGE PROFILE
    </text>
    <text x="${layout.contentLeft}" y="${layout.titleY}" fill="${theme.title}" font-size="${layout.titleSize}" font-weight="700" font-family="${SVG_FONT_STACK}">
      Most Used Languages
    </text>
    <text x="${layout.contentLeft}" y="${layout.subtitleY}" fill="${theme.subtitle}" font-size="${layout.subtitleSize}" font-family="${SVG_FONT_STACK}">
      ${escapeXml(subtitleLabel)}
    </text>
    <path d="M${layout.contentLeft} ${layout.dividerY}H${layout.contentRight}" stroke="${theme.trackStroke}" stroke-linecap="round"/>
  </g>

  <g clip-path="url(#cardClip)">
    ${rows}
    ${emptyStateBlock}
  </g>
</svg>
`.trim();
}

export default async function handler(req, res) {
  const langsCount = parseIntegerParam(req.query.langs_count, 6, 1, 20);
  const cardWidth = parseIntegerParam(req.query.card_width, 360, 280, 560);
  const disableAnimations = parseBooleanParam(req.query.disable_animations);
  const themeName = parseThemeParam(req.query.theme);
  const username = String(getQueryValue(req.query.username)).trim();

  try {
    if (!username) {
      res.setHeader("Content-Type", "image/svg+xml");
      return res.status(400).send(
        createSvg({
          username: "",
          languages: [],
          langsCount,
          cardWidth,
          disableAnimations,
          state: buildState("missing-username"),
          themeName,
        }),
      );
    }

    const hiddenLanguages = buildHiddenLanguageSet(req.query.hide);

    const githubHeaders = {
      Accept: "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN
        ? {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }
        : {}),
    };

    const reposResponse = await fetch(
      `${GITHUB_API}/users/${username}/repos?per_page=100&type=owner`,
      {
        headers: githubHeaders,
      },
    );

    if (!reposResponse.ok) {
      res.setHeader("Content-Type", "image/svg+xml");
      return res.status(reposResponse.status).send(
        createSvg({
          username,
          languages: [],
          langsCount,
          cardWidth,
          disableAnimations,
          state: buildState("github-error", reposResponse.status),
          themeName,
        }),
      );
    }

    const repos = await reposResponse.json();
    const languageTotals = {};

    await Promise.all(
      repos
        .filter((repo) => !repo.fork)
        .map(async (repo) => {
          const response = await fetch(repo.languages_url, {
            headers: githubHeaders,
          });

          if (!response.ok) {
            return;
          }

          const languages = await response.json();

          for (const [language, bytes] of Object.entries(languages)) {
            if (hiddenLanguages.has(normalizeLanguage(language))) {
              continue;
            }

            languageTotals[language] = (languageTotals[language] || 0) + bytes;
          }
        }),
    );

    const totalBytes = Object.values(languageTotals).reduce(
      (acc, value) => acc + value,
      0,
    );

    const languages = Object.entries(languageTotals)
      .map(([language, bytes]) => ({
        language,
        bytes,
        percentage: totalBytes
          ? Number(((bytes / totalBytes) * 100).toFixed(2))
          : 0,
      }))
      .sort((a, b) => b.bytes - a.bytes);

    const state = languages.length > 0 ? null : buildState("empty-languages");

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate=86400",
    );

    return res.status(200).send(
      createSvg({
        username,
        languages,
        langsCount,
        cardWidth,
        disableAnimations,
        state: state || buildState("empty-languages"),
        themeName,
      }),
    );
  } catch {
    res.setHeader("Content-Type", "image/svg+xml");
    return res.status(500).send(
      createSvg({
        username,
        languages: [],
        langsCount,
        cardWidth,
        disableAnimations,
        state: buildState("error"),
        themeName,
      }),
    );
  }
}

export { createSvg };
