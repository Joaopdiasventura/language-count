package util

import (
	"fmt"
	"strconv"
	"strings"
)

type RGB struct {
	R int
	G int
	B int
}

func HexToRGB(hex string) *RGB {
	normalized := strings.TrimSpace(strings.TrimPrefix(hex, "#"))
	expanded := normalized
	if len(normalized) == 3 {
		var builder strings.Builder
		builder.Grow(6)
		for _, part := range normalized {
			builder.WriteRune(part)
			builder.WriteRune(part)
		}
		expanded = builder.String()
	}

	if len(expanded) != 6 {
		return nil
	}

	for _, character := range expanded {
		switch {
		case character >= '0' && character <= '9':
		case character >= 'a' && character <= 'f':
		case character >= 'A' && character <= 'F':
		default:
			return nil
		}
	}

	r, _ := strconv.ParseInt(expanded[0:2], 16, 64)
	g, _ := strconv.ParseInt(expanded[2:4], 16, 64)
	b, _ := strconv.ParseInt(expanded[4:6], 16, 64)

	return &RGB{R: int(r), G: int(g), B: int(b)}
}

func MixHexColors(baseHex, mixHex string, weight float64) string {
	base := HexToRGB(baseHex)
	mix := HexToRGB(mixHex)
	if base == nil || mix == nil {
		return baseHex
	}

	ratio := ClampFloat(weight, 0, 1)
	toHex := func(value float64) string {
		return fmt.Sprintf("%02x", int(mathRound(value)))
	}

	return "#" +
		toHex(float64(base.R)+(float64(mix.R-base.R)*ratio)) +
		toHex(float64(base.G)+(float64(mix.G-base.G)*ratio)) +
		toHex(float64(base.B)+(float64(mix.B-base.B)*ratio))
}

func ToRGBA(hex string, alpha float64) string {
	color := HexToRGB(hex)
	if color == nil {
		return "rgba(255, 255, 255, " + NumberString(Round(alpha)) + ")"
	}

	return fmt.Sprintf(
		"rgba(%d, %d, %d, %s)",
		color.R,
		color.G,
		color.B,
		NumberString(Round(alpha)),
	)
}

func mathRound(value float64) float64 {
	if value < 0 {
		return float64(int(value - 0.5))
	}

	return float64(int(value + 0.5))
}
