package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Joaopdiasventura/language-count/internal/httpapi"
)

func main() {
	addr := ":" + port()
	app := httpapi.NewApp(httpapi.Config{
		AccessToken: os.Getenv("GITHUB_TOKEN"),
	})

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
