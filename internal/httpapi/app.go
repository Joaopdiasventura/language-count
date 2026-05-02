package httpapi

import (
	"io"
	"net"
	"net/http"
	"time"

	"github.com/Joaopdiasventura/language-count/internal/githubapi"
	"github.com/Joaopdiasventura/language-count/internal/pipeline"
	svgcard "github.com/Joaopdiasventura/language-count/internal/svg"
)

const (
	svgContentType  = "image/svg+xml"
	svgCacheControl = "s-maxage=3600, stale-while-revalidate=86400"
)

type Config struct {
	AccessToken   string
	HTTPClient    *http.Client
	GitHubAPIBase string
}

type App struct {
	githubClient *githubapi.Client
}

func NewApp(config Config) *App {
	return &App{
		githubClient: githubapi.NewClient(githubapi.Config{
			AccessToken: config.AccessToken,
			BaseURL:     config.GitHubAPIBase,
			HTTPClient:  defaultHTTPClient(config.HTTPClient),
		}),
	}
}

func (app *App) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	options := ParseRequestOptions(r.URL.Query())

	defer func() {
		if recover() != nil {
			app.sendSVGResponse(w, http.StatusInternalServerError, svgcard.CreateSVG(
				options.Username,
				nil,
				options.LangsCount,
				options.CardWidth,
				options.DisableAnimations,
				BuildState("error", 0),
				options.ThemeName,
			), false)
		}
	}()

	if options.Username == "" {
		app.sendSVGResponse(w, http.StatusBadRequest, svgcard.CreateSVG(
			"",
			nil,
			options.LangsCount,
			options.CardWidth,
			options.DisableAnimations,
			BuildState("missing-username", 0),
			options.ThemeName,
		), false)
		return
	}

	repositoriesResponse, err := app.githubClient.FetchOwnerRepositories(r.Context(), options.Username)
	if err != nil {
		app.sendSVGResponse(w, http.StatusInternalServerError, svgcard.CreateSVG(
			options.Username,
			nil,
			options.LangsCount,
			options.CardWidth,
			options.DisableAnimations,
			BuildState("error", 0),
			options.ThemeName,
		), false)
		return
	}

	if !repositoriesResponse.OK {
		app.sendSVGResponse(w, repositoriesResponse.Status, svgcard.CreateSVG(
			options.Username,
			nil,
			options.LangsCount,
			options.CardWidth,
			options.DisableAnimations,
			BuildState("github-error", repositoriesResponse.Status),
			options.ThemeName,
		), false)
		return
	}

	hiddenLanguages := pipeline.BuildHiddenLanguageSet(options.Hide)
	languageTotals, err := pipeline.AggregateRepositoryLanguages(
		r.Context(),
		repositoriesResponse.Data,
		app.githubClient,
		hiddenLanguages,
	)
	if err != nil {
		app.sendSVGResponse(w, http.StatusInternalServerError, svgcard.CreateSVG(
			options.Username,
			nil,
			options.LangsCount,
			options.CardWidth,
			options.DisableAnimations,
			BuildState("error", 0),
			options.ThemeName,
		), false)
		return
	}

	languages := pipeline.CalculateLanguageBreakdown(languageTotals)
	app.sendSVGResponse(w, http.StatusOK, svgcard.CreateSVG(
		options.Username,
		languages,
		options.LangsCount,
		options.CardWidth,
		options.DisableAnimations,
		BuildState("empty-languages", 0),
		options.ThemeName,
	), true)
}

func (app *App) sendSVGResponse(w http.ResponseWriter, statusCode int, svg string, cacheable bool) {
	w.Header().Set("Content-Type", svgContentType)
	if cacheable {
		w.Header().Set("Cache-Control", svgCacheControl)
	}

	w.WriteHeader(statusCode)
	_, _ = io.WriteString(w, svg)
}

func defaultHTTPClient(client *http.Client) *http.Client {
	if client != nil {
		return client
	}

	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.MaxIdleConns = 64
	transport.MaxIdleConnsPerHost = 32
	transport.MaxConnsPerHost = 64
	transport.IdleConnTimeout = 90 * time.Second
	transport.DialContext = (&net.Dialer{
		Timeout:   5 * time.Second,
		KeepAlive: 30 * time.Second,
	}).DialContext

	return &http.Client{
		Timeout:   9 * time.Second,
		Transport: transport,
	}
}
