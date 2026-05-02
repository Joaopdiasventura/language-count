package pipeline

import (
	"context"
	"sort"
	"strings"
	"sync"

	"github.com/Joaopdiasventura/language-count/internal/githubapi"
	"github.com/Joaopdiasventura/language-count/internal/model"
	"github.com/Joaopdiasventura/language-count/internal/util"
)

var hiddenLanguages = []string{
	"HTML",
	"CSS",
	"SCSS",
	"Less",
	"Blade",
	"Dockerfile",
	"Shell",
	"Batchfile",
	"PowerShell",
	"Makefile",
}

type LanguageFetcher interface {
	FetchRepositoryLanguages(
		ctx context.Context,
		languagesURL string,
	) (githubapi.Response[[]model.OrderedLanguageBytes], error)
}

type LanguageTotals map[string]*LanguageTotal

type LanguageTotal struct {
	Language            string
	Bytes               int64
	FirstRepository     int
	FirstLanguageOffset int
}

type repositoryResult struct {
	index    int
	response githubapi.Response[[]model.OrderedLanguageBytes]
	err      error
}

func BuildHiddenLanguageSet(rawHide string) map[string]struct{} {
	queryLanguages := strings.Split(rawHide, ",")
	hidden := make(map[string]struct{}, len(hiddenLanguages)+len(queryLanguages))

	for _, language := range hiddenLanguages {
		hidden[util.NormalizeLanguage(language)] = struct{}{}
	}

	for _, language := range queryLanguages {
		normalized := util.NormalizeLanguage(language)
		if normalized == "" {
			continue
		}

		hidden[normalized] = struct{}{}
	}

	return hidden
}

func AggregateRepositoryLanguages(
	ctx context.Context,
	repositories []model.Repository,
	githubClient LanguageFetcher,
	hidden map[string]struct{},
) (LanguageTotals, error) {
	nonForkCount := 0
	results := make([]*repositoryResult, len(repositories))
	for _, repository := range repositories {
		if repository.Fork {
			continue
		}

		nonForkCount++
	}

	if nonForkCount == 0 {
		return LanguageTotals{}, nil
	}

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	resultChannel := make(chan repositoryResult, nonForkCount)
	var waitGroup sync.WaitGroup

	for index, repository := range repositories {
		if repository.Fork {
			continue
		}

		waitGroup.Add(1)
		go func(index int, languagesURL string) {
			defer waitGroup.Done()

			response, err := githubClient.FetchRepositoryLanguages(ctx, languagesURL)
			resultChannel <- repositoryResult{
				index:    index,
				response: response,
				err:      err,
			}
		}(index, repository.LanguagesURL)
	}

	go func() {
		waitGroup.Wait()
		close(resultChannel)
	}()

	var firstError error
	for result := range resultChannel {
		if result.err != nil && firstError == nil {
			firstError = result.err
			cancel()
		}

		copied := result
		results[result.index] = &copied
	}

	if firstError != nil {
		return nil, firstError
	}

	languageTotals := make(LanguageTotals)
	for repositoryIndex, result := range results {
		if result == nil || !result.response.OK {
			continue
		}

		for languageIndex, item := range result.response.Data {
			if _, ok := hidden[util.NormalizeLanguage(item.Language)]; ok {
				continue
			}

			total, ok := languageTotals[item.Language]
			if !ok {
				total = &LanguageTotal{
					Language:            item.Language,
					FirstRepository:     repositoryIndex,
					FirstLanguageOffset: languageIndex,
				}
				languageTotals[item.Language] = total
			}

			total.Bytes += item.Bytes
		}
	}

	return languageTotals, nil
}

func CalculateLanguageBreakdown(languageTotals LanguageTotals) []model.LanguageBreakdown {
	totalBytes := int64(0)
	for _, value := range languageTotals {
		totalBytes += value.Bytes
	}

	breakdown := make([]model.LanguageBreakdown, 0, len(languageTotals))
	for _, value := range languageTotals {
		breakdown = append(breakdown, model.LanguageBreakdown{
			Language:   value.Language,
			Bytes:      value.Bytes,
			Percentage: percentage(value.Bytes, totalBytes),
		})
	}

	sort.SliceStable(breakdown, func(leftIndex, rightIndex int) bool {
		left := breakdown[leftIndex]
		right := breakdown[rightIndex]
		if left.Bytes != right.Bytes {
			return left.Bytes > right.Bytes
		}

		leftMeta := languageTotals[left.Language]
		rightMeta := languageTotals[right.Language]
		if leftMeta.FirstRepository != rightMeta.FirstRepository {
			return leftMeta.FirstRepository < rightMeta.FirstRepository
		}

		return leftMeta.FirstLanguageOffset < rightMeta.FirstLanguageOffset
	})

	return breakdown
}

func percentage(bytes, totalBytes int64) float64 {
	if totalBytes == 0 {
		return 0
	}

	numerator := bytes * 10000
	roundedBasisPoints := (2*numerator + totalBytes) / (2 * totalBytes)
	return float64(roundedBasisPoints) / 100
}
