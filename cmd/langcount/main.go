package main

import (
	"log"
	"net/http"
	"os"

	languagecount "github.com/Joaopdiasventura/language-count"
)

func main() {
	addr := ":" + port()
	app := languagecount.NewHTTPHandler(os.Getenv("GITHUB_TOKEN"))

	log.Printf("language-count listening on %s", addr)
	if err := http.ListenAndServe(addr, app); err != nil {
		log.Fatal(err)
	}
}

func port() string {
	if value := os.Getenv("PORT"); value != "" {
		return value
	}

	return "8080"
}
