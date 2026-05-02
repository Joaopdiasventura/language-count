package handler

import (
	"net/http"
	"os"

	"github.com/Joaopdiasventura/language-count/internal/httpapi"
)

var app = httpapi.NewApp(httpapi.Config{
	AccessToken: os.Getenv("GITHUB_TOKEN"),
})

func Handler(w http.ResponseWriter, r *http.Request) {
	app.ServeHTTP(w, r)
}
