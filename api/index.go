package handler

import (
	"net/http"
	"os"

	languagecount "github.com/Joaopdiasventura/language-count"
)

var app = languagecount.NewHTTPHandler(os.Getenv("GITHUB_TOKEN"))

func Handler(w http.ResponseWriter, r *http.Request) {
	app.ServeHTTP(w, r)
}
