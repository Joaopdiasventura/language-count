import {
  DEFAULT_THEME,
  THEME_NEUTRALS,
  THEME_VARIANTS,
} from "../constants.mjs";
import { mixHexColors, toRgba } from "../utils/color.mjs";

export function isSupportedTheme(themeName) {
  return Object.prototype.hasOwnProperty.call(THEME_VARIANTS, themeName);
}

export function buildThemePalette(themeName) {
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
    cardFillMid: mixHexColors(
      neutrals.cardFillMid,
      accentDeep,
      variant.cardTint * 0.62,
    ),
    cardFillEnd: mixHexColors(
      neutrals.cardFillEnd,
      accentDeep,
      variant.cardTint * 0.34,
    ),
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
