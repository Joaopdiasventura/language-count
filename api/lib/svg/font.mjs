import { readFileSync } from "node:fs";

const AZONIX_FONT_BASE64 = readFileSync(
  new URL("../../../fonts/Azonix.otf", import.meta.url),
).toString("base64");

const SVG_FONT_FAMILY = "Azonix";

export const SVG_FONT_STACK = `'${SVG_FONT_FAMILY}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;

export const SVG_FONT_FACE_CSS = `
@font-face {
  font-family: '${SVG_FONT_FAMILY}';
  src: url(data:font/otf;base64,${AZONIX_FONT_BASE64}) format('opentype');
  font-style: normal;
  font-weight: 400;
}
`.trim();
