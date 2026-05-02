package util

import (
	"fmt"
	"regexp"
	"strings"
)

var whitespacePattern = regexp.MustCompile(`\s+`)

func NormalizeLanguage(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func EscapeXML(value string) string {
	replacer := strings.NewReplacer(
		"&", "&amp;",
		"<", "&lt;",
		">", "&gt;",
		`"`, "&quot;",
		"'", "&apos;",
	)

	return replacer.Replace(value)
}

func TruncateText(value string, maxLength int) string {
	runes := []rune(value)
	if len(runes) <= maxLength {
		return value
	}

	if maxLength <= 3 {
		return string(runes[:maxLength])
	}

	return string(runes[:maxLength-3]) + "..."
}

func WrapText(value string, maxChars, maxLines int) []string {
	text := strings.TrimSpace(value)
	if text == "" {
		return nil
	}

	words := whitespacePattern.Split(text, -1)
	lines := make([]string, 0, maxLines)
	currentLine := ""

	for index := 0; index < len(words); index++ {
		word := words[index]
		nextLine := word
		if currentLine != "" {
			nextLine = currentLine + " " + word
		}

		if len([]rune(nextLine)) <= maxChars {
			currentLine = nextLine
			continue
		}

		if currentLine == "" {
			currentLine = TruncateText(word, maxChars)
		}

		lines = append(lines, currentLine)
		if len(lines) == maxLines-1 {
			remaining := strings.Join(words[index:], " ")
			lines = append(lines, TruncateText(remaining, maxChars))
			return lines
		}

		if len([]rune(word)) > maxChars {
			currentLine = TruncateText(word, maxChars)
			continue
		}

		currentLine = word
	}

	if currentLine != "" {
		lines = append(lines, currentLine)
	}

	if len(lines) > maxLines {
		return lines[:maxLines]
	}

	return lines
}

func EstimateCharCapacity(availableWidth, fontSize, factor float64) int {
	return max(4, int(mathFloor(availableWidth/(fontSize*factor))))
}

func EstimateTextWidth(value string, fontSize, factor float64) float64 {
	total := 0.0
	for _, character := range value {
		total += fontSize * factor * glyphWidthFactor(character)
	}

	return total
}

func TruncateTextToWidth(value string, maxWidth, fontSize, factor float64) string {
	if EstimateTextWidth(value, fontSize, factor) <= maxWidth {
		return value
	}

	ellipsis := "..."
	ellipsisWidth := EstimateTextWidth(ellipsis, fontSize, factor)
	if ellipsisWidth >= maxWidth {
		return ellipsis
	}

	output := strings.Builder{}
	for _, character := range value {
		nextValue := output.String() + string(character)
		if EstimateTextWidth(nextValue, fontSize, factor)+ellipsisWidth > maxWidth {
			break
		}

		output.WriteRune(character)
	}

	if output.Len() == 0 {
		return ellipsis
	}

	return output.String() + ellipsis
}

func FormatPercentage(value float64) string {
	formatted := fmt.Sprintf("%.2f", value)
	formatted = strings.TrimSuffix(formatted, ".00")
	if strings.HasSuffix(formatted, "0") && strings.Contains(formatted, ".") {
		formatted = strings.TrimSuffix(formatted, "0")
	}

	return formatted + "%"
}

func glyphWidthFactor(character rune) float64 {
	switch {
	case character == ' ':
		return 0.36
	case strings.ContainsRune(".,:;!|", character):
		return 0.28
	case strings.ContainsRune("-_/\\()[]{}", character):
		return 0.42
	case character == '@':
		return 0.92
	case strings.ContainsRune("MW", character):
		return 1.02
	case character >= 'A' && character <= 'Z':
		return 0.84
	case strings.ContainsRune("mw", character):
		return 0.9
	case strings.ContainsRune("iljtfr", character):
		return 0.5
	case character >= '0' && character <= '9':
		return 0.72
	default:
		return 0.72
	}
}

func mathFloor(value float64) float64 {
	if value < 0 {
		return float64(int(value - 1))
	}

	return float64(int(value))
}
