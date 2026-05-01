import { round, scaleValue } from "../utils/math.mjs";

export function getCardLayout(width, visibleCount) {
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
  const decorationX =
    contentRight - decorationWidth + round(scaleValue(width, 280, 560, 8, 6));
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
