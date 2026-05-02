package pipeline

import (
	"context"
	"testing"

	"github.com/Joaopdiasventura/language-count/internal/githubapi"
	"github.com/Joaopdiasventura/language-count/internal/model"
)

type stubFetcher struct {
	responses map[string]githubapi.Response[[]model.OrderedLanguageBytes]
}

func (fetcher stubFetcher) FetchRepositoryLanguages(
	_ context.Context,
	languagesURL string,
) (githubapi.Response[[]model.OrderedLanguageBytes], error) {
	return fetcher.responses[languagesURL], nil
}

func TestCalculateLanguageBreakdownUsesRepositoryOrderForTies(t *testing.T) {
	repositories := []model.Repository{
		{LanguagesURL: "repo1"},
		{LanguagesURL: "repo2"},
	}

	totals, err := AggregateRepositoryLanguages(context.Background(), repositories, stubFetcher{
		responses: map[string]githubapi.Response[[]model.OrderedLanguageBytes]{
			"repo1": {
				OK: true,
				Data: []model.OrderedLanguageBytes{
					{Language: "JavaScript", Bytes: 50},
				},
			},
			"repo2": {
				OK: true,
				Data: []model.OrderedLanguageBytes{
					{Language: "TypeScript", Bytes: 50},
				},
			},
		},
	}, BuildHiddenLanguageSet(""))
	if err != nil {
		t.Fatalf("AggregateRepositoryLanguages error: %v", err)
	}

	breakdown := CalculateLanguageBreakdown(totals)
	if len(breakdown) != 2 {
		t.Fatalf("breakdown length mismatch: %d", len(breakdown))
	}

	if breakdown[0].Language != "JavaScript" || breakdown[1].Language != "TypeScript" {
		t.Fatalf("unexpected tie order: %#v", breakdown)
	}
}
