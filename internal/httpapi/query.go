package httpapi

import (
	"net/url"
	"strconv"
	"strings"

	"github.com/Joaopdiasventura/language-count/internal/model"
	"github.com/Joaopdiasventura/language-count/internal/theme"
	"github.com/Joaopdiasventura/language-count/internal/util"
)

const (
	defaultLanguageLimit = 6
	minLanguageLimit     = 1
	maxLanguageLimit     = 20

	defaultCardWidth = 360
	minCardWidth     = 280
	maxCardWidth     = 560
)

func ParseRequestOptions(query url.Values) model.RequestOptions {
	return model.RequestOptions{
		Username:          strings.TrimSpace(queryValue(query, "username")),
		Hide:              queryValue(query, "hide"),
		LangsCount:        parseIntegerParam(resolveLanguageLimitValue(query), defaultLanguageLimit, minLanguageLimit, maxLanguageLimit),
		CardWidth:         parseIntegerParam(queryValue(query, "card_width"), defaultCardWidth, minCardWidth, maxCardWidth),
		DisableAnimations: parseBooleanParam(queryValue(query, "disable_animations")),
		ThemeName:         parseThemeParam(queryValue(query, "theme")),
	}
}

func parseIntegerParam(value string, defaultValue, minValue, maxValue int) int {
	parsed, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil {
		return defaultValue
	}

	return util.ClampInt(parsed, minValue, maxValue)
}

func parseBooleanParam(value string) bool {
	normalized := strings.ToLower(strings.TrimSpace(value))
	return normalized == "true" || normalized == "1"
}

func parseThemeParam(value string) string {
	normalized := util.NormalizeLanguage(value)
	if normalized == "" {
		return theme.DefaultTheme
	}

	if theme.IsSupportedTheme(normalized) {
		return normalized
	}

	return theme.DefaultTheme
}

func resolveLanguageLimitValue(query url.Values) string {
	return pickFirstNonEmptyQueryValue(
		queryValues(query, "limit"),
		queryValues(query, "langs_count"),
	)
}

func queryValue(query url.Values, key string) string {
	values := queryValues(query, key)
	if len(values) == 0 {
		return ""
	}

	return values[0]
}

func queryValues(query url.Values, key string) []string {
	values, ok := query[key]
	if !ok {
		return nil
	}

	return values
}

func pickFirstNonEmptyQueryValue(values ...[]string) string {
	for _, group := range values {
		resolved := strings.TrimSpace(getQueryValue(group))
		if resolved != "" {
			return resolved
		}
	}

	if len(values) == 0 {
		return ""
	}

	return getQueryValue(values[len(values)-1])
}

func getQueryValue(values []string) string {
	if len(values) == 0 {
		return ""
	}

	return values[0]
}
