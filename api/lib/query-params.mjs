import {
  DEFAULT_CARD_WIDTH,
  DEFAULT_LANGUAGE_LIMIT,
  DEFAULT_THEME,
  MAX_CARD_WIDTH,
  MAX_LANGUAGE_LIMIT,
  MIN_CARD_WIDTH,
  MIN_LANGUAGE_LIMIT,
} from "./constants.mjs";
import { isSupportedTheme } from "./themes/index.mjs";
import {
  getQueryValue,
  normalizeLanguage,
  pickFirstNonEmptyQueryValue,
} from "./utils/text.mjs";
import { clamp } from "./utils/math.mjs";

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

export function parseThemeParam(value) {
  const normalized = normalizeLanguage(getQueryValue(value));

  if (!normalized) {
    return DEFAULT_THEME;
  }

  return isSupportedTheme(normalized) ? normalized : DEFAULT_THEME;
}

function resolveLanguageLimitValue(query) {
  return pickFirstNonEmptyQueryValue(query.limit, query.langs_count);
}

export function parseRequestOptions(query = {}) {
  return {
    username: String(getQueryValue(query.username)).trim(),
    hide: getQueryValue(query.hide),
    langsCount: parseIntegerParam(
      resolveLanguageLimitValue(query),
      DEFAULT_LANGUAGE_LIMIT,
      MIN_LANGUAGE_LIMIT,
      MAX_LANGUAGE_LIMIT,
    ),
    cardWidth: parseIntegerParam(
      query.card_width,
      DEFAULT_CARD_WIDTH,
      MIN_CARD_WIDTH,
      MAX_CARD_WIDTH,
    ),
    disableAnimations: parseBooleanParam(query.disable_animations),
    themeName: parseThemeParam(query.theme),
  };
}
