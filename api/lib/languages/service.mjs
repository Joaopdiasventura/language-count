import { HIDDEN_LANGUAGES, LANGUAGE_COLORS } from "../constants.mjs";
import { normalizeLanguage } from "../utils/text.mjs";

const LANGUAGE_COLORS_BY_NAME = Object.fromEntries(
  Object.entries(LANGUAGE_COLORS).map(([language, color]) => [
    normalizeLanguage(language),
    color,
  ]),
);

export function getLanguageColor(language) {
  return LANGUAGE_COLORS_BY_NAME[normalizeLanguage(language)] || "#b29b96";
}

export function buildHiddenLanguageSet(rawHide) {
  const queryLanguages = String(rawHide)
    .split(",")
    .map((language) => normalizeLanguage(language))
    .filter(Boolean);

  return new Set([
    ...HIDDEN_LANGUAGES.map((language) => normalizeLanguage(language)),
    ...queryLanguages,
  ]);
}

export async function aggregateRepositoryLanguages({
  repositories,
  githubClient,
  hiddenLanguages,
}) {
  const languageTotals = {};

  await Promise.all(
    repositories
      .filter((repository) => !repository.fork)
      .map(async (repository) => {
        const response = await githubClient.fetchRepositoryLanguages(
          repository.languages_url,
        );

        if (!response.ok) {
          return;
        }

        for (const [language, bytes] of Object.entries(response.data)) {
          if (hiddenLanguages.has(normalizeLanguage(language))) {
            continue;
          }

          languageTotals[language] = (languageTotals[language] || 0) + bytes;
        }
      }),
  );

  return languageTotals;
}

export function calculateLanguageBreakdown(languageTotals) {
  const totalBytes = Object.values(languageTotals).reduce(
    (accumulator, value) => accumulator + value,
    0,
  );

  return Object.entries(languageTotals)
    .map(([language, bytes]) => ({
      language,
      bytes,
      percentage: totalBytes
        ? Number(((bytes / totalBytes) * 100).toFixed(2))
        : 0,
    }))
    .sort((left, right) => right.bytes - left.bytes);
}
