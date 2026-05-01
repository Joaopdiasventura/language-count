import { DEFAULT_THEME } from "../constants.mjs";
import {
  estimateCharCapacity,
  escapeXml,
  formatPercentage,
  truncateText,
  truncateTextToWidth,
  wrapText,
} from "../utils/text.mjs";
import { round, scaleValue } from "../utils/math.mjs";
import { mixHexColors } from "../utils/color.mjs";
import { getLanguageColor } from "../languages/service.mjs";
import { buildThemePalette } from "../themes/index.mjs";
import { SVG_FONT_FACE_CSS, SVG_FONT_STACK } from "./font.mjs";
import { getCardLayout } from "./layout.mjs";

function buildBarGradientDefs(languages, theme) {
  return languages
    .map((item, index) => {
      const color = getLanguageColor(item.language);
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
  const color = getLanguageColor(item.language);
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
  const highlightWidth =
    renderedBarWidth > 0 ? Math.max(0, renderedBarWidth - 1.2) : 0;
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

export function createSvg({
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
