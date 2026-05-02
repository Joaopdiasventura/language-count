package svg

import (
	"testing"

	"github.com/Joaopdiasventura/language-count/internal/model"
)

func BenchmarkCreateSVG(b *testing.B) {
	languages := []model.LanguageBreakdown{
		{Language: "JavaScript", Bytes: 120, Percentage: 35.29},
		{Language: "TypeScript", Bytes: 120, Percentage: 35.29},
		{Language: "Go", Bytes: 80, Percentage: 23.53},
		{Language: "Rust", Bytes: 20, Percentage: 5.88},
	}

	state := model.CardState{
		Badge:   "NO VISIBLE DATA",
		Title:   "No visible languages",
		Message: "All detected languages were filtered out or no public code was found.",
	}

	b.ReportAllocs()
	for b.Loop() {
		_ = CreateSVG("Joaopdiasventura", languages, 6, 420, false, state, "red")
	}
}
