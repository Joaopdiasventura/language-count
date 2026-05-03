package server

import (
	"net/http"

	"github.com/Joaopdiasventura/language-count/internal/httpapi"
)

func NewHTTPHandler(accessToken string) http.Handler {
	return httpapi.NewApp(httpapi.Config{
		AccessToken: accessToken,
	})
}
