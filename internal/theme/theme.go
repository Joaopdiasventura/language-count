package theme

import (
	"github.com/Joaopdiasventura/language-count/internal/util"
)

const DefaultTheme = "red"

type Variant struct {
	Accent          string
	Glow            string
	NeutralSet      string
	CardTint        float64
	BeamAlpha       float64
	LanguageTint    float64
	ShadowGlowAlpha float64
}

type Neutrals struct {
	CardFillStart string
	CardFillMid   string
	CardFillEnd   string
	ShadowBase    string
	Title         string
	Label         string
	Subtitle      string
	Metric        string
	Eyebrow       string
	Badge         string
	EmptyTitle    string
}

type Palette struct {
	Name                string
	Accent              string
	AccentDeep          string
	AccentLift          string
	AccentMuted         string
	LanguageTint        float64
	CardFillStart       string
	CardFillMid         string
	CardFillEnd         string
	ShadowBase          string
	ShadowAccent        string
	AmbientInner        string
	AmbientMid          string
	AmbientOuter        string
	BorderStart         string
	BorderMid           string
	BorderEnd           string
	InnerStroke         string
	TopBeamAccent       string
	TrackFillStart      string
	TrackFillEnd        string
	TrackStroke         string
	EmptyStateFillStart string
	EmptyStateFillEnd   string
	EmptyStateBorder    string
	BadgeFill           string
	BadgeStroke         string
	Title               string
	Label               string
	Subtitle            string
	Metric              string
	Eyebrow             string
	BadgeText           string
	EmptyTitle          string
	BgWave              string
	ShardStart          string
	ShardMid            string
	ShardInner          string
	ShardLine           string
	RowDotStroke        string
	BarHighlight        string
}

var variants = map[string]Variant{
	"red": {
		Accent:          "#c4323d",
		Glow:            "#7d1118",
		NeutralSet:      "warm",
		CardTint:        0.1,
		BeamAlpha:       0.42,
		LanguageTint:    0.18,
		ShadowGlowAlpha: 0.05,
	},
	"blue": {
		Accent:          "#3376d2",
		Glow:            "#163f84",
		NeutralSet:      "cool",
		CardTint:        0.08,
		BeamAlpha:       0.4,
		LanguageTint:    0.15,
		ShadowGlowAlpha: 0.045,
	},
	"yellow": {
		Accent:          "#c79a30",
		Glow:            "#7b5a12",
		NeutralSet:      "warm",
		CardTint:        0.08,
		BeamAlpha:       0.36,
		LanguageTint:    0.12,
		ShadowGlowAlpha: 0.04,
	},
	"purple": {
		Accent:          "#7a52d0",
		Glow:            "#4c2c86",
		NeutralSet:      "cool",
		CardTint:        0.08,
		BeamAlpha:       0.41,
		LanguageTint:    0.16,
		ShadowGlowAlpha: 0.045,
	},
	"green": {
		Accent:          "#309559",
		Glow:            "#1b6237",
		NeutralSet:      "cool",
		CardTint:        0.07,
		BeamAlpha:       0.37,
		LanguageTint:    0.14,
		ShadowGlowAlpha: 0.04,
	},
	"white": {
		Accent:          "#dce2e8",
		Glow:            "#8996a4",
		NeutralSet:      "cool",
		CardTint:        0.04,
		BeamAlpha:       0.28,
		LanguageTint:    0.08,
		ShadowGlowAlpha: 0.03,
	},
}

var neutralSets = map[string]Neutrals{
	"warm": {
		CardFillStart: "#0f0c0d",
		CardFillMid:   "#090708",
		CardFillEnd:   "#060506",
		ShadowBase:    "#050405",
		Title:         "#f4ece9",
		Label:         "#f4ece9",
		Subtitle:      "#b39f9a",
		Metric:        "#b9aaa6",
		Eyebrow:       "#c9a7a1",
		Badge:         "#d6beb7",
		EmptyTitle:    "#f5ece8",
	},
	"cool": {
		CardFillStart: "#0d0f11",
		CardFillMid:   "#08090a",
		CardFillEnd:   "#050506",
		ShadowBase:    "#040506",
		Title:         "#eef2f6",
		Label:         "#eef2f6",
		Subtitle:      "#b6bec8",
		Metric:        "#bec7d0",
		Eyebrow:       "#d4dce4",
		Badge:         "#dde3ea",
		EmptyTitle:    "#eef2f6",
	},
}

var languageColors = map[string]string{
	"astro":            "#ff5a03",
	"batchfile":        "#c1f12e",
	"c":                "#555555",
	"c#":               "#178600",
	"c++":              "#f34b7d",
	"css":              "#563d7c",
	"dart":             "#00B4AB",
	"dockerfile":       "#384d54",
	"elixir":           "#6e4a7e",
	"go":               "#00add8",
	"html":             "#e34c26",
	"java":             "#b07219",
	"javascript":       "#f1e05a",
	"json":             "#292929",
	"jupyter":          "#DA5B0B",
	"jupyter notebook": "#DA5B0B",
	"kotlin":           "#A97BFF",
	"less":             "#1d365d",
	"lua":              "#000080",
	"markdown":         "#083fa1",
	"php":              "#4F5D95",
	"powershell":       "#012456",
	"python":           "#3572A5",
	"ruby":             "#701516",
	"rust":             "#dea584",
	"scss":             "#c6538c",
	"shell":            "#89e051",
	"sql":              "#e38c00",
	"svelte":           "#ff3e00",
	"swift":            "#F05138",
	"tsx":              "#3178c6",
	"typescript":       "#3178c6",
	"vue":              "#41b883",
	"yaml":             "#cb171e",
}

func IsSupportedTheme(themeName string) bool {
	_, ok := variants[themeName]
	return ok
}

func BuildThemePalette(themeName string) Palette {
	variant, ok := variants[themeName]
	if !ok {
		variant = variants[DefaultTheme]
	}

	neutrals, ok := neutralSets[variant.NeutralSet]
	if !ok {
		neutrals = neutralSets["warm"]
	}

	accent := variant.Accent
	glow := variant.Glow
	accentDeep := util.MixHexColors(accent, "#000000", 0.38)
	accentLift := util.MixHexColors(accent, "#ffffff", 0.14)
	accentMuted := util.MixHexColors(accent, "#1a1517", 0.72)
	textTint := 0.05
	subtitleTint := 0.10
	if variant.NeutralSet == "cool" {
		textTint = 0.08
		subtitleTint = 0.14
	}

	return Palette{
		Name:                themeName,
		Accent:              accent,
		AccentDeep:          accentDeep,
		AccentLift:          accentLift,
		AccentMuted:         accentMuted,
		LanguageTint:        variant.LanguageTint,
		CardFillStart:       util.MixHexColors(neutrals.CardFillStart, accent, variant.CardTint),
		CardFillMid:         util.MixHexColors(neutrals.CardFillMid, accentDeep, variant.CardTint*0.62),
		CardFillEnd:         util.MixHexColors(neutrals.CardFillEnd, accentDeep, variant.CardTint*0.34),
		ShadowBase:          util.ToRGBA(neutrals.ShadowBase, 0.34),
		ShadowAccent:        util.ToRGBA(glow, variant.ShadowGlowAlpha),
		AmbientInner:        util.ToRGBA(glow, 0.2),
		AmbientMid:          util.ToRGBA(accentDeep, 0.1),
		AmbientOuter:        util.ToRGBA(accentDeep, 0),
		BorderStart:         util.MixHexColors("#3a2a2f", accent, 0.28),
		BorderMid:           util.MixHexColors("#251b1e", accentMuted, 0.22),
		BorderEnd:           util.MixHexColors("#1a1315", accentDeep, 0.16),
		InnerStroke:         util.ToRGBA(util.MixHexColors("#ffffff", accent, 0.06), 0.05),
		TopBeamAccent:       util.ToRGBA(accent, variant.BeamAlpha),
		TrackFillStart:      util.MixHexColors("#181214", accent, 0.08),
		TrackFillEnd:        util.MixHexColors("#241a1d", accentDeep, 0.14),
		TrackStroke:         util.ToRGBA(util.MixHexColors("#ffffff", accent, 0.15), 0.06),
		EmptyStateFillStart: util.MixHexColors("#110d0f", accent, 0.08),
		EmptyStateFillEnd:   util.MixHexColors("#090708", accentDeep, 0.06),
		EmptyStateBorder:    util.MixHexColors("#2f2326", accent, 0.24),
		BadgeFill:           util.MixHexColors("#151113", accent, 0.14),
		BadgeStroke:         util.MixHexColors("#40272c", accent, 0.34),
		Title:               util.MixHexColors(neutrals.Title, accentLift, textTint*0.6),
		Label:               util.MixHexColors(neutrals.Label, accentLift, textTint),
		Subtitle:            util.MixHexColors(neutrals.Subtitle, accentLift, subtitleTint),
		Metric:              util.MixHexColors(neutrals.Metric, accentLift, subtitleTint),
		Eyebrow:             util.MixHexColors(neutrals.Eyebrow, accentLift, 0.16),
		BadgeText:           util.MixHexColors(neutrals.Badge, accentLift, 0.14),
		EmptyTitle:          util.MixHexColors(neutrals.EmptyTitle, accentLift, 0.08),
		BgWave:              util.ToRGBA(accentDeep, 0.13),
		ShardStart:          util.ToRGBA(accent, 0.22),
		ShardMid:            util.ToRGBA(accentDeep, 0.14),
		ShardInner:          util.ToRGBA(accentLift, 0.07),
		ShardLine:           util.ToRGBA(util.MixHexColors("#ffffff", accent, 0.18), 0.07),
		RowDotStroke:        util.ToRGBA(util.MixHexColors("#ffffff", accent, 0.18), 0.16),
		BarHighlight:        util.ToRGBA(util.MixHexColors("#ffffff", accent, 0.12), 0.24),
	}
}

func GetLanguageColor(language string) string {
	color, ok := languageColors[util.NormalizeLanguage(language)]
	if !ok {
		return "#b29b96"
	}

	return color
}
