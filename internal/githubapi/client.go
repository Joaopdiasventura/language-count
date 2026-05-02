package githubapi

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/Joaopdiasventura/language-count/internal/model"
)

const (
	defaultGitHubAPI = "https://api.github.com"
	acceptHeader     = "application/vnd.github+json"
	userAgentHeader  = "node"
)

type Config struct {
	AccessToken string
	BaseURL     string
	HTTPClient  *http.Client
}

type Client struct {
	accessToken string
	baseURL     string
	httpClient  *http.Client
}

type Response[T any] struct {
	OK     bool
	Status int
	Data   T
}

func NewClient(config Config) *Client {
	baseURL := strings.TrimRight(config.BaseURL, "/")
	if baseURL == "" {
		baseURL = defaultGitHubAPI
	}

	httpClient := config.HTTPClient
	if httpClient == nil {
		httpClient = http.DefaultClient
	}

	return &Client{
		accessToken: config.AccessToken,
		baseURL:     baseURL,
		httpClient:  httpClient,
	}
}

func (client *Client) FetchOwnerRepositories(
	ctx context.Context,
	username string,
) (Response[[]model.Repository], error) {
	request, err := client.newRequest(
		ctx,
		http.MethodGet,
		fmt.Sprintf("%s/users/%s/repos?per_page=100&type=owner", client.baseURL, username),
	)
	if err != nil {
		return Response[[]model.Repository]{}, err
	}

	response, err := client.httpClient.Do(request)
	if err != nil {
		return Response[[]model.Repository]{}, err
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return Response[[]model.Repository]{
			OK:     false,
			Status: response.StatusCode,
		}, nil
	}

	var repositories []model.Repository
	if err := json.NewDecoder(response.Body).Decode(&repositories); err != nil {
		return Response[[]model.Repository]{}, err
	}

	return Response[[]model.Repository]{
		OK:     true,
		Status: response.StatusCode,
		Data:   repositories,
	}, nil
}

func (client *Client) FetchRepositoryLanguages(
	ctx context.Context,
	languagesURL string,
) (Response[[]model.OrderedLanguageBytes], error) {
	request, err := client.newRequest(ctx, http.MethodGet, languagesURL)
	if err != nil {
		return Response[[]model.OrderedLanguageBytes]{}, err
	}

	response, err := client.httpClient.Do(request)
	if err != nil {
		return Response[[]model.OrderedLanguageBytes]{}, err
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return Response[[]model.OrderedLanguageBytes]{
			OK:     false,
			Status: response.StatusCode,
		}, nil
	}

	entries, err := decodeOrderedLanguageBytes(response.Body)
	if err != nil {
		return Response[[]model.OrderedLanguageBytes]{}, err
	}

	return Response[[]model.OrderedLanguageBytes]{
		OK:     true,
		Status: response.StatusCode,
		Data:   entries,
	}, nil
}

func (client *Client) newRequest(
	ctx context.Context,
	method string,
	rawURL string,
) (*http.Request, error) {
	request, err := http.NewRequestWithContext(ctx, method, rawURL, nil)
	if err != nil {
		return nil, err
	}

	request.Header.Set("Accept", acceptHeader)
	request.Header.Set("User-Agent", userAgentHeader)
	if client.accessToken != "" {
		request.Header.Set("Authorization", "Bearer "+client.accessToken)
	}

	return request, nil
}

func decodeOrderedLanguageBytes(reader io.Reader) ([]model.OrderedLanguageBytes, error) {
	decoder := json.NewDecoder(reader)
	token, err := decoder.Token()
	if err != nil {
		return nil, err
	}

	delim, ok := token.(json.Delim)
	if !ok || delim != '{' {
		return nil, errors.New("language payload must be a JSON object")
	}

	entries := make([]model.OrderedLanguageBytes, 0, 8)
	for decoder.More() {
		keyToken, err := decoder.Token()
		if err != nil {
			return nil, err
		}

		key, ok := keyToken.(string)
		if !ok {
			return nil, errors.New("language key must be a string")
		}

		var bytes int64
		if err := decoder.Decode(&bytes); err != nil {
			return nil, err
		}

		entries = append(entries, model.OrderedLanguageBytes{
			Language: key,
			Bytes:    bytes,
		})
	}

	if _, err := decoder.Token(); err != nil {
		return nil, err
	}

	return entries, nil
}
