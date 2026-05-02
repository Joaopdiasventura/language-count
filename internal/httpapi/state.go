package httpapi

import (
	"strconv"

	"github.com/Joaopdiasventura/language-count/internal/model"
)

func BuildState(stateKey string, statusCode int) model.CardState {
	if stateKey == "missing-username" {
		return model.CardState{
			Badge:   "INPUT REQUIRED",
			Title:   "No username provided",
			Message: "Add ?username=your-github-handle to generate this card.",
		}
	}

	if stateKey == "empty-languages" {
		return model.CardState{
			Badge:   "NO VISIBLE DATA",
			Title:   "No visible languages",
			Message: "All detected languages were filtered out or no public code was found.",
		}
	}

	if stateKey == "error" {
		return model.CardState{
			Badge:   "GENERATION ERROR",
			Title:   "Unable to build card",
			Message: "The generator failed before the SVG could be completed.",
		}
	}

	if statusCode == 404 {
		return model.CardState{
			Badge:   "PROFILE NOT FOUND",
			Title:   "Profile unavailable",
			Message: "No public GitHub profile matched this username.",
		}
	}

	return model.CardState{
		Badge:   "GITHUB UNAVAILABLE",
		Title:   "GitHub request failed",
		Message: "GitHub returned status " + strconv.Itoa(statusCode) + " while loading repositories.",
	}
}
