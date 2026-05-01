export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function round(value) {
  return Number(value.toFixed(2));
}

export function scaleValue(input, inputMin, inputMax, outputMin, outputMax) {
  if (input <= inputMin) {
    return outputMin;
  }

  if (input >= inputMax) {
    return outputMax;
  }

  const progress = (input - inputMin) / (inputMax - inputMin);
  return outputMin + (outputMax - outputMin) * progress;
}
