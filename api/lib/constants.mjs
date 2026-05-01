export const GITHUB_API = "https://api.github.com";

export const SVG_CONTENT_TYPE = "image/svg+xml";
export const SVG_CACHE_CONTROL = "s-maxage=3600, stale-while-revalidate=86400";

export const DEFAULT_LANGUAGE_LIMIT = 6;
export const MIN_LANGUAGE_LIMIT = 1;
export const MAX_LANGUAGE_LIMIT = 20;

export const DEFAULT_CARD_WIDTH = 360;
export const MIN_CARD_WIDTH = 280;
export const MAX_CARD_WIDTH = 560;

export const DEFAULT_THEME = "red";

export const HIDDEN_LANGUAGES = [
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

export const LANGUAGE_COLORS = {
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

export const THEME_VARIANTS = {
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

export const THEME_NEUTRALS = {
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
