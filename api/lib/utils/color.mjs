import { clamp, round } from "./math.mjs";

export function hexToRgb(hex) {
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

export function mixHexColors(baseHex, mixHex, weight) {
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

export function toRgba(hex, alpha) {
  const color = hexToRgb(hex);

  if (!color) {
    return `rgba(255, 255, 255, ${round(alpha)})`;
  }

  return `rgba(${color.r}, ${color.g}, ${color.b}, ${round(alpha)})`;
}
