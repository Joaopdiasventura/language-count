package httpapi

import (
	"crypto/sha256"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

type fixtureResponse struct {
	Status       int
	BodyJSON     string
	ThrowMessage string
}

type appResponse struct {
	StatusCode int
	Headers    map[string]string
	Body       string
	SHA256     string
}

type roundTripperFunc func(*http.Request) (*http.Response, error)

func (fn roundTripperFunc) RoundTrip(request *http.Request) (*http.Response, error) {
	return fn(request)
}

func TestAppScenarios(t *testing.T) {
	baseResponses := func(username string) map[string]fixtureResponse {
		repositoriesURL := repoListURL(username)
		repo1 := "https://fixtures.test/repos/1/languages"
		repo2 := "https://fixtures.test/repos/2/languages"
		repo3 := "https://fixtures.test/repos/3/languages"

		return map[string]fixtureResponse{
			repositoriesURL: {
				Status: 200,
				BodyJSON: repoListJSON(
					repoJSON(false, repo1),
					repoJSON(false, repo2),
					repoJSON(true, repo3),
				),
			},
			repo1: {
				Status:   200,
				BodyJSON: languageJSON(languageEntry("JavaScript", 120), languageEntry("Go", 80), languageEntry("Markdown", 20)),
			},
			repo2: {
				Status:   200,
				BodyJSON: languageJSON(languageEntry("TypeScript", 120), languageEntry("Rust", 20), languageEntry("JSON", 10)),
			},
			repo3: {
				Status:   200,
				BodyJSON: languageJSON(languageEntry("Shell", 9999)),
			},
		}
	}

	cases := []struct {
		name            string
		rawQuery        string
		responses       map[string]fixtureResponse
		expectedStatus  int
		expectedCache   string
		contains        []string
		notContains     []string
		orderedContains [][2]string
	}{
		{
			name:           "missing username",
			expectedStatus: 400,
			contains:       []string{"INPUT REQUIRED", "No username provided"},
		},
		{
			name:           "github 404",
			rawQuery:       "username=missing",
			expectedStatus: 404,
			responses: map[string]fixtureResponse{
				repoListURL("missing"): {Status: 404, BodyJSON: `{}`},
			},
			contains: []string{"PROFILE NOT FOUND", "No public GitHub profile matched this username."},
		},
		{
			name:           "github 500",
			rawQuery:       "username=down",
			expectedStatus: 500,
			responses: map[string]fixtureResponse{
				repoListURL("down"): {Status: 500, BodyJSON: `{}`},
			},
			contains: []string{"GITHUB UNAVAILABLE", "GitHub returned status 500 while loading repositories."},
		},
		{
			name:           "repo list transport failure",
			rawQuery:       "username=boom",
			expectedStatus: 500,
			responses: map[string]fixtureResponse{
				repoListURL("boom"): {ThrowMessage: "boom"},
			},
			contains: []string{"GENERATION ERROR", "Unable to build card"},
		},
		{
			name:           "empty visible languages",
			rawQuery:       "username=empty",
			expectedStatus: 200,
			expectedCache:  "s-maxage=3600, stale-while-revalidate=86400",
			responses: map[string]fixtureResponse{
				repoListURL("empty"):            {Status: 200, BodyJSON: repoListJSON(repoJSON(false, "https://fixtures.test/empty/1"))},
				"https://fixtures.test/empty/1": {Status: 200, BodyJSON: languageJSON(languageEntry("HTML", 10), languageEntry("CSS", 8))},
			},
			contains: []string{"NO VISIBLE DATA", "All detected languages were filtered out or no public code was found."},
		},
		{
			name:           "success animated",
			rawQuery:       "username=ok",
			expectedStatus: 200,
			expectedCache:  "s-maxage=3600, stale-while-revalidate=86400",
			responses:      baseResponses("ok"),
			contains:       []string{`attributeName="opacity"`, `attributeName="width"`, "Most used languages for ok"},
		},
		{
			name:           "success static",
			rawQuery:       "username=ok&disable_animations=true",
			expectedStatus: 200,
			expectedCache:  "s-maxage=3600, stale-while-revalidate=86400",
			responses:      baseResponses("ok"),
			notContains:    []string{`attributeName="opacity"`, `attributeName="width"`},
		},
		{
			name:           "clamp max and min",
			rawQuery:       "username=ok&langs_count=999&card_width=100",
			expectedStatus: 200,
			expectedCache:  "s-maxage=3600, stale-while-revalidate=86400",
			responses:      baseResponses("ok"),
			contains:       []string{`<svg width="280"`, "Top 6 languages sorted by repository byte count."},
		},
		{
			name:           "clamp lower and alias",
			rawQuery:       "username=ok&limit=1&langs_count=9&card_width=999",
			expectedStatus: 200,
			expectedCache:  "s-maxage=3600, stale-while-revalidate=86400",
			responses:      baseResponses("ok"),
			contains:       []string{`<svg width="560"`, "Top 1 languages sorted by repository byte count.", "JavaScript"},
			notContains:    []string{"TypeScript"},
		},
		{
			name: "repeated params first value wins",
			rawQuery: strings.Join([]string{
				"username=ok",
				"username=ignored",
				"theme=BLUE",
				"theme=red",
				"hide=Markdown",
				"hide=JSON",
				"card_width=420",
				"card_width=500",
			}, "&"),
			expectedStatus: 200,
			expectedCache:  "s-maxage=3600, stale-while-revalidate=86400",
			responses:      baseResponses("ok"),
			contains: []string{
				`<svg width="420"`,
				"rgba(22, 63, 132, 0.04)",
				"JSON",
			},
			notContains: []string{"Markdown"},
		},
		{
			name:           "case insensitive hide",
			rawQuery:       "username=ok&hide=jAvAsCrIpT",
			expectedStatus: 200,
			expectedCache:  "s-maxage=3600, stale-while-revalidate=86400",
			responses:      baseResponses("ok"),
			contains:       []string{"TypeScript"},
			notContains:    []string{"JavaScript"},
		},
		{
			name:           "partial language failure skipped",
			rawQuery:       "username=partial",
			expectedStatus: 200,
			expectedCache:  "s-maxage=3600, stale-while-revalidate=86400",
			responses: map[string]fixtureResponse{
				repoListURL("partial"):            {Status: 200, BodyJSON: repoListJSON(repoJSON(false, "https://fixtures.test/partial/1"), repoJSON(false, "https://fixtures.test/partial/2"))},
				"https://fixtures.test/partial/1": {Status: 200, BodyJSON: languageJSON(languageEntry("Go", 100), languageEntry("Rust", 20))},
				"https://fixtures.test/partial/2": {Status: 500, BodyJSON: `{}`},
			},
			contains:    []string{"Go", "Rust"},
			notContains: []string{"GITHUB UNAVAILABLE"},
		},
		{
			name:           "language transport failure returns 500",
			rawQuery:       "username=transport",
			expectedStatus: 500,
			responses: map[string]fixtureResponse{
				repoListURL("transport"):            {Status: 200, BodyJSON: repoListJSON(repoJSON(false, "https://fixtures.test/transport/1"))},
				"https://fixtures.test/transport/1": {ThrowMessage: "language fetch failed"},
			},
			contains: []string{"GENERATION ERROR", "Unable to build card"},
		},
		{
			name:           "repo order tie break",
			rawQuery:       "username=tie",
			expectedStatus: 200,
			expectedCache:  "s-maxage=3600, stale-while-revalidate=86400",
			responses: map[string]fixtureResponse{
				repoListURL("tie"):            {Status: 200, BodyJSON: repoListJSON(repoJSON(false, "https://fixtures.test/tie/1"), repoJSON(false, "https://fixtures.test/tie/2"))},
				"https://fixtures.test/tie/1": {Status: 200, BodyJSON: languageJSON(languageEntry("JavaScript", 50), languageEntry("Go", 1))},
				"https://fixtures.test/tie/2": {Status: 200, BodyJSON: languageJSON(languageEntry("TypeScript", 50), languageEntry("Rust", 1))},
			},
			orderedContains: [][2]string{{"JavaScript", "TypeScript"}},
		},
	}

	for _, testCase := range cases {
		t.Run(testCase.name, func(t *testing.T) {
			response := runGoApp(t, testCase.rawQuery, testCase.responses)

			if response.StatusCode != testCase.expectedStatus {
				t.Fatalf("status mismatch: got=%d want=%d", response.StatusCode, testCase.expectedStatus)
			}

			if response.Headers["Content-Type"] != "image/svg+xml" {
				t.Fatalf("content-type mismatch: %q", response.Headers["Content-Type"])
			}

			if response.Headers["Cache-Control"] != testCase.expectedCache {
				t.Fatalf("cache-control mismatch: got=%q want=%q", response.Headers["Cache-Control"], testCase.expectedCache)
			}

			for _, fragment := range testCase.contains {
				if !strings.Contains(response.Body, fragment) {
					t.Fatalf("expected body to contain %q", fragment)
				}
			}

			for _, fragment := range testCase.notContains {
				if strings.Contains(response.Body, fragment) {
					t.Fatalf("expected body to not contain %q", fragment)
				}
			}

			for _, pair := range testCase.orderedContains {
				leftIndex := strings.Index(response.Body, pair[0])
				rightIndex := strings.Index(response.Body, pair[1])
				if leftIndex < 0 || rightIndex < 0 {
					t.Fatalf("missing ordering fragments %q / %q", pair[0], pair[1])
				}

				if leftIndex >= rightIndex {
					t.Fatalf("expected %q before %q", pair[0], pair[1])
				}
			}
		})
	}
}

func TestThemeVariantsProduceDistinctSVGs(t *testing.T) {
	baseResponses := map[string]fixtureResponse{
		repoListURL("ok"): {
			Status: 200,
			BodyJSON: repoListJSON(
				repoJSON(false, "https://fixtures.test/repos/1/languages"),
				repoJSON(false, "https://fixtures.test/repos/2/languages"),
			),
		},
		"https://fixtures.test/repos/1/languages": {
			Status:   200,
			BodyJSON: languageJSON(languageEntry("JavaScript", 120), languageEntry("Go", 80)),
		},
		"https://fixtures.test/repos/2/languages": {
			Status:   200,
			BodyJSON: languageJSON(languageEntry("TypeScript", 120), languageEntry("Rust", 20)),
		},
	}

	themes := []string{"red", "blue", "yellow", "purple", "green", "white"}
	seen := make(map[string]string, len(themes))

	for _, themeName := range themes {
		response := runGoApp(t, "username=ok&theme="+themeName, baseResponses)
		if response.StatusCode != 200 {
			t.Fatalf("theme %s returned status %d", themeName, response.StatusCode)
		}

		if previousTheme, ok := seen[response.SHA256]; ok {
			t.Fatalf("theme %s matched checksum of theme %s", themeName, previousTheme)
		}

		seen[response.SHA256] = themeName
	}
}

func runGoApp(
	t *testing.T,
	rawQuery string,
	responses map[string]fixtureResponse,
) appResponse {
	t.Helper()

	app := NewApp(Config{
		AccessToken: "token",
		HTTPClient: &http.Client{
			Transport: roundTripperFunc(func(request *http.Request) (*http.Response, error) {
				fixture, ok := responses[request.URL.String()]
				if !ok {
					return nil, fmt.Errorf("missing test fixture for %s", request.URL.String())
				}

				if fixture.ThrowMessage != "" {
					return nil, fmt.Errorf("%s", fixture.ThrowMessage)
				}

				return &http.Response{
					StatusCode: fixture.Status,
					Header:     make(http.Header),
					Body:       io.NopCloser(strings.NewReader(fixture.BodyJSON)),
					Request:    request,
				}, nil
			}),
		},
		GitHubAPIBase: "https://api.github.com",
	})

	target := "/"
	if rawQuery != "" {
		target += "?" + rawQuery
	}

	request := httptest.NewRequest(http.MethodGet, target, nil)
	recorder := httptest.NewRecorder()
	app.ServeHTTP(recorder, request)

	body := recorder.Body.String()
	return appResponse{
		StatusCode: recorder.Code,
		Headers: map[string]string{
			"Content-Type":  recorder.Header().Get("Content-Type"),
			"Cache-Control": recorder.Header().Get("Cache-Control"),
		},
		Body:   body,
		SHA256: checksum(body),
	}
}

func repoListURL(username string) string {
	return "https://api.github.com/users/" + username + "/repos?per_page=100&type=owner"
}

func repoJSON(fork bool, languagesURL string) string {
	return fmt.Sprintf(`{"fork":%t,"languages_url":"%s"}`, fork, languagesURL)
}

func repoListJSON(repositories ...string) string {
	return "[" + strings.Join(repositories, ",") + "]"
}

type languagePair struct {
	Name  string
	Bytes int64
}

func languageEntry(name string, bytes int64) languagePair {
	return languagePair{Name: name, Bytes: bytes}
}

func languageJSON(entries ...languagePair) string {
	parts := make([]string, 0, len(entries))
	for _, entry := range entries {
		parts = append(parts, fmt.Sprintf(`"%s":%d`, entry.Name, entry.Bytes))
	}

	return "{" + strings.Join(parts, ",") + "}"
}

func checksum(value string) string {
	sum := sha256.Sum256([]byte(value))
	return fmt.Sprintf("%x", sum)
}
