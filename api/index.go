package handler

import (
	"net/http"
	"os"

	"github.com/Joaopdiasventura/language-count/server"
)

var app = server.NewHTTPHandler(os.Getenv("GITHUB_TOKEN"))

func Handler(w http.ResponseWriter, r *http.Request) {
	app.ServeHTTP(w, r)
}
