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

const SVG_FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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

function buildRowSvg({
  item,
  index,
  contentWidth,
  barX,
  barWidth,
  disableAnimations,
  labelSize,
  percentageSize,
  rowY,
}) {
  const color = getColor(item.language);
  const percentageLabel = formatPercentage(item.percentage);
  const renderedBarWidth =
    item.percentage > 0
      ? Math.max(6, Number(((item.percentage / 100) * barWidth).toFixed(2)))
      : 0;
  const percentageColumnWidth = contentWidth < 310 ? 46 : 54;
  const labelMaxChars = Math.max(
    10,
    Math.floor(
      (contentWidth - percentageColumnWidth - 22) / (labelSize * 0.55),
    ),
  );
  const label = truncateText(item.language, labelMaxChars);
  const beginMs = 110 + index * 70;
  const fillBeginMs = beginMs + 90;
  const openGroup = disableAnimations
    ? `<g transform="translate(0 ${rowY})">`
    : `<g transform="translate(0 ${rowY})" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="360ms" begin="${beginMs}ms" fill="freeze"/>
      `;

  const fillRect = disableAnimations
    ? `<rect x="${barX}" y="21" width="${renderedBarWidth}" height="7" rx="999" fill="${color}"/>`
    : `<rect x="${barX}" y="21" width="0" height="7" rx="999" fill="${color}">
        <animate attributeName="width" from="0" to="${renderedBarWidth}" dur="680ms" begin="${fillBeginMs}ms" fill="freeze"/>
      </rect>`;

  return `
      ${openGroup}
        <circle cx="5" cy="11" r="4.5" fill="${color}"/>
        <text x="17" y="13" fill="#f5ece8" font-size="${labelSize}" font-weight="600" font-family="${SVG_FONT_STACK}">
          ${escapeXml(label)}
        </text>
        <text x="${contentWidth}" y="13" fill="#a69691" font-size="${percentageSize}" font-family="${SVG_FONT_STACK}" text-anchor="end">
          ${percentageLabel}
        </text>
        <rect x="${barX}" y="21" width="${barWidth}" height="7" rx="999" fill="url(#trackFill)"/>
        ${fillRect}
        <rect x="${barX}" y="21" width="${renderedBarWidth}" height="2" rx="999" fill="rgba(255, 255, 255, 0.24)"/>
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
}) {
  const visibleLanguages = languages.slice(0, langsCount);
  const width = cardWidth;
  const outerInset = width < 320 ? 10 : 12;
  const contentX = clamp(Math.round(width * 0.072), 20, 30);
  const contentWidth = width - contentX * 2;
  const titleSize = width < 320 ? 18 : width < 440 ? 20 : 22;
  const subtitleSize = width < 320 ? 10.5 : 11.5;
  const labelSize = width < 320 ? 11.8 : 12.8;
  const percentageSize = width < 320 ? 11 : 11.8;
  const eyebrowSize = 10;
  const headerTop = 30;
  const rowHeight = width < 320 ? 36 : 38;
  const barX = 17;
  const barWidth = contentWidth - barX;
  const subtitleLabel = username
    ? `GitHub code distribution for @${truncateText(username, 28)}`
    : "GitHub code distribution for your profile";
  const listStartY = headerTop + 57;
  const emptyPanelHeight = 92;
  const badgeWidth =
    visibleLanguages.length > 0
      ? 0
      : Math.min(
          contentWidth - 32,
          Math.max(92, Math.round(state.badge.length * 6.2 + 24)),
        );
  const contentHeight =
    visibleLanguages.length > 0
      ? visibleLanguages.length * rowHeight
      : emptyPanelHeight;
  const height = Math.round(listStartY + contentHeight + 28);
  const innerWidth = width - outerInset * 2;
  const innerHeight = height - outerInset * 2;
  const shardX = width - contentX - (width < 340 ? 84 : 96);
  const shardY = 24;
  const title = username
    ? `Most used languages for ${username}`
    : "Most used languages card";
  const description =
    visibleLanguages.length > 0
      ? `Top ${visibleLanguages.length} languages sorted by repository byte count.`
      : state.message;

  const rows = visibleLanguages
    .map((item, index) =>
      buildRowSvg({
        item,
        index,
        contentWidth,
        barX,
        barWidth,
        disableAnimations,
        labelSize,
        percentageSize,
        rowY: listStartY + index * rowHeight,
      }),
    )
    .join("\n");

  const emptyStateBlock =
    visibleLanguages.length > 0
      ? ""
      : `
    <g transform="translate(${contentX} ${listStartY + 4})">
      <rect width="${contentWidth}" height="${emptyPanelHeight}" rx="18" fill="url(#emptyStateFill)" stroke="#2a2023"/>
      <rect x="16" y="16" width="${badgeWidth}" height="22" rx="999" fill="#151113" stroke="#40272c"/>
      <text x="30" y="31" fill="#d6beb7" font-size="9.5" font-weight="700" font-family="${SVG_FONT_STACK}" letter-spacing="0.12em">
        ${escapeXml(state.badge)}
      </text>
      <text x="16" y="56" fill="#f5ece8" font-size="${titleSize - 1}" font-weight="700" font-family="${SVG_FONT_STACK}">
        ${escapeXml(state.title)}
      </text>
      <text x="16" y="76" fill="#a69691" font-size="${subtitleSize}" font-family="${SVG_FONT_STACK}">
        ${escapeXml(truncateText(state.message, Math.max(42, Math.floor(contentWidth / 6))))}
      </text>
    </g>
  `.trim();

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="cardTitle cardDesc">
  <title id="cardTitle">${escapeXml(title)}</title>
  <desc id="cardDesc">${escapeXml(description)}</desc>
  <defs>
    <linearGradient id="cardFill" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0e0b0d"/>
      <stop offset="58%" stop-color="#090708"/>
      <stop offset="100%" stop-color="#060506"/>
    </linearGradient>
    <radialGradient id="ambientGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width - contentX} ${headerTop - 8}) rotate(132) scale(${width * 0.48} ${height * 0.74})">
      <stop offset="0%" stop-color="rgba(146, 25, 36, 0.18)"/>
      <stop offset="48%" stop-color="rgba(122, 0, 0, 0.10)"/>
      <stop offset="100%" stop-color="rgba(122, 0, 0, 0)"/>
    </radialGradient>
    <linearGradient id="innerBorder" x1="${outerInset}" y1="${outerInset}" x2="${width - outerInset}" y2="${height - outerInset}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3a2a2f"/>
      <stop offset="55%" stop-color="#251b1e"/>
      <stop offset="100%" stop-color="#1a1315"/>
    </linearGradient>
    <linearGradient id="topBeam" x1="${contentX}" y1="0" x2="${width - contentX}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0)"/>
      <stop offset="42%" stop-color="rgba(224, 26, 26, 0.46)"/>
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0)"/>
    </linearGradient>
    <linearGradient id="trackFill" x1="0" y1="0" x2="${barWidth}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#181214"/>
      <stop offset="100%" stop-color="#23181c"/>
    </linearGradient>
    <linearGradient id="emptyStateFill" x1="0" y1="0" x2="${contentWidth}" y2="${emptyPanelHeight}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#110d0f"/>
      <stop offset="100%" stop-color="#0a0809"/>
    </linearGradient>
    <linearGradient id="shardFill" x1="${shardX}" y1="${shardY}" x2="${shardX + 96}" y2="${shardY + 96}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="rgba(224, 26, 26, 0.30)"/>
      <stop offset="58%" stop-color="rgba(122, 0, 0, 0.18)"/>
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0)"/>
    </linearGradient>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feOffset dy="14"/>
      <feGaussianBlur stdDeviation="14"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.0196 0 0 0 0 0.0157 0 0 0 0 0.0196 0 0 0 0.36 0"/>
    </filter>
  </defs>

  <g filter="url(#cardShadow)">
    <rect x="${outerInset}" y="${outerInset}" width="${innerWidth}" height="${innerHeight}" rx="22" fill="url(#cardFill)"/>
  </g>
  <rect x="${outerInset}" y="${outerInset}" width="${innerWidth}" height="${innerHeight}" rx="22" fill="url(#ambientGlow)" stroke="url(#innerBorder)"/>
  <rect x="${outerInset + 1}" y="${outerInset + 1}" width="${innerWidth - 2}" height="${innerHeight - 2}" rx="21" stroke="rgba(255, 255, 255, 0.04)"/>
  <path d="M${contentX} ${outerInset + 1.5}H${width - contentX}" stroke="url(#topBeam)" stroke-width="1.2" stroke-linecap="round"/>

  <g opacity="0.75">
    <path d="M${shardX + 12} ${shardY}L${shardX + 86} ${shardY + 24}L${shardX + 58} ${shardY + 96}L${shardX - 2} ${shardY + 70}Z" fill="url(#shardFill)"/>
    <path d="M${shardX + 36} ${shardY + 8}L${shardX + 71} ${shardY + 20}L${shardX + 58} ${shardY + 55}L${shardX + 26} ${shardY + 42}Z" fill="rgba(255, 255, 255, 0.05)"/>
    <path d="M${shardX + 4} ${shardY + 70}L${shardX + 58} ${shardY + 96}" stroke="rgba(255, 255, 255, 0.07)"/>
    <path d="M${shardX + 58} ${shardY + 96}L${shardX + 86} ${shardY + 24}" stroke="rgba(255, 255, 255, 0.07)"/>
  </g>

  <text x="${contentX}" y="${headerTop}" fill="#c9a7a1" font-size="${eyebrowSize}" font-weight="700" font-family="${SVG_FONT_STACK}" letter-spacing="0.18em">
    LANGUAGE PROFILE
  </text>
  <text x="${contentX}" y="${headerTop + 22}" fill="#f5ece8" font-size="${titleSize}" font-weight="700" font-family="${SVG_FONT_STACK}">
    Most Used Languages
  </text>
  <text x="${contentX}" y="${headerTop + 41}" fill="#a69691" font-size="${subtitleSize}" font-family="${SVG_FONT_STACK}">
    ${escapeXml(subtitleLabel)}
  </text>
  <path d="M${contentX} ${headerTop + 56}H${width - contentX}" stroke="rgba(255, 255, 255, 0.05)" stroke-linecap="round"/>

  ${rows}
  ${emptyStateBlock}
</svg>
`.trim();
}

export default async function handler(req, res) {
  const langsCount = parseIntegerParam(req.query.langs_count, 6, 1, 20);
  const cardWidth = parseIntegerParam(req.query.card_width, 360, 280, 560);
  const disableAnimations = parseBooleanParam(req.query.disable_animations);
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
      }),
    );
  }
}

export { createSvg };
