export function normalizeLanguage(value) {
  return String(value).trim().toLowerCase();
}

export function getQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

export function pickFirstNonEmptyQueryValue(...values) {
  for (const value of values) {
    const resolved = String(getQueryValue(value)).trim();

    if (resolved) {
      return resolved;
    }
  }

  return getQueryValue(values.at(-1));
}

export function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function truncateText(value, maxLength) {
  const text = String(value);

  if (text.length <= maxLength) {
    return text;
  }

  if (maxLength <= 3) {
    return text.slice(0, maxLength);
  }

  return `${text.slice(0, maxLength - 3)}...`;
}

export function wrapText(value, maxChars, maxLines = 2) {
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

export function estimateCharCapacity(availableWidth, fontSize, factor = 0.57) {
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

export function estimateTextWidth(value, fontSize, factor = 0.88) {
  return Array.from(String(value)).reduce(
    (total, character) =>
      total + fontSize * factor * getGlyphWidthFactor(character),
    0,
  );
}

export function truncateTextToWidth(value, maxWidth, fontSize, factor = 0.88) {
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

    if (
      estimateTextWidth(nextValue, fontSize, factor) + ellipsisWidth >
      maxWidth
    ) {
      break;
    }

    output = nextValue;
  }

  return output ? `${output}${ellipsis}` : ellipsis;
}

export function formatPercentage(value) {
  return `${value
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1")}%`;
}
