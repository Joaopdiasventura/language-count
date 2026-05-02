package githubapi

import (
	"strings"
	"testing"
)

func TestDecodeOrderedLanguageBytes(t *testing.T) {
	entries, err := decodeOrderedLanguageBytes(strings.NewReader(`{"TypeScript":120,"Go":80,"Rust":20}`))
	if err != nil {
		t.Fatalf("decodeOrderedLanguageBytes error: %v", err)
	}

	if len(entries) != 3 {
		t.Fatalf("entry count mismatch: %d", len(entries))
	}

	if entries[0].Language != "TypeScript" || entries[1].Language != "Go" || entries[2].Language != "Rust" {
		t.Fatalf("language order mismatch: %#v", entries)
	}
}
