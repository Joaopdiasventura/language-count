package pipeline

import (
	"context"
	"testing"

	"github.com/Joaopdiasventura/language-count/internal/githubapi"
	"github.com/Joaopdiasventura/language-count/internal/model"
)

type benchmarkFetcher struct{}

func (benchmarkFetcher) FetchRepositoryLanguages(
	_ context.Context,
	_ string,
) (githubapi.Response[[]model.OrderedLanguageBytes], error) {
	return githubapi.Response[[]model.OrderedLanguageBytes]{
		OK: true,
		Data: []model.OrderedLanguageBytes{
			{Language: "JavaScript", Bytes: 120},
			{Language: "TypeScript", Bytes: 120},
			{Language: "Go", Bytes: 80},
			{Language: "Rust", Bytes: 20},
		},
	}, nil
}

func BenchmarkAggregateRepositoryLanguages(b *testing.B) {
	repositories := make([]model.Repository, 12)
	for index := range repositories {
		repositories[index] = model.Repository{LanguagesURL: "repo"}
	}

	hidden := BuildHiddenLanguageSet("")
	b.ReportAllocs()
	for b.Loop() {
		if _, err := AggregateRepositoryLanguages(context.Background(), repositories, benchmarkFetcher{}, hidden); err != nil {
			b.Fatal(err)
		}
	}
}
