package model

type RequestOptions struct {
	Username          string
	Hide              string
	LangsCount        int
	CardWidth         int
	DisableAnimations bool
	ThemeName         string
}

type CardState struct {
	Badge   string
	Title   string
	Message string
}

type Repository struct {
	Fork         bool   `json:"fork"`
	LanguagesURL string `json:"languages_url"`
}

type OrderedLanguageBytes struct {
	Language string
	Bytes    int64
}

type LanguageBreakdown struct {
	Language   string
	Bytes      int64
	Percentage float64
}
