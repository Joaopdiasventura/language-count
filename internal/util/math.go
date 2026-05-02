package util

import (
	"math"
	"strconv"
)

func ClampInt(value, minValue, maxValue int) int {
	if value < minValue {
		return minValue
	}

	if value > maxValue {
		return maxValue
	}

	return value
}

func ClampFloat(value, minValue, maxValue float64) float64 {
	return math.Min(maxValue, math.Max(minValue, value))
}

func Round(value float64) float64 {
	formatted := strconv.FormatFloat(value, 'f', 2, 64)
	parsed, err := strconv.ParseFloat(formatted, 64)
	if err != nil {
		return value
	}

	return parsed
}

func ScaleValue(input, inputMin, inputMax, outputMin, outputMax float64) float64 {
	if input <= inputMin {
		return outputMin
	}

	if input >= inputMax {
		return outputMax
	}

	progress := (input - inputMin) / (inputMax - inputMin)
	return outputMin + (outputMax-outputMin)*progress
}

func NumberString(value float64) string {
	if math.Abs(value) < 1e-12 {
		return "0"
	}

	return strconv.FormatFloat(value, 'f', -1, 64)
}
