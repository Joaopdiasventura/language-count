package httpapi

import (
	"net/url"
	"testing"
)

func TestParseRequestOptions(t *testing.T) {
	query := url.Values{
		"username":           {" first ", "second"},
		"limit":              {"4"},
		"langs_count":        {"9"},
		"card_width":         {"999"},
		"disable_animations": {"1"},
		"theme":              {"BLUE"},
		"hide":               {"Markdown,JSON"},
	}

	options := ParseRequestOptions(query)
	if options.Username != "first" {
		t.Fatalf("username mismatch: %q", options.Username)
	}

	if options.LangsCount != 4 {
		t.Fatalf("langsCount mismatch: %d", options.LangsCount)
	}

	if options.CardWidth != 560 {
		t.Fatalf("cardWidth mismatch: %d", options.CardWidth)
	}

	if !options.DisableAnimations {
		t.Fatal("disableAnimations mismatch")
	}

	if options.ThemeName != "blue" {
		t.Fatalf("theme mismatch: %q", options.ThemeName)
	}

	if options.Hide != "Markdown,JSON" {
		t.Fatalf("hide mismatch: %q", options.Hide)
	}
}
