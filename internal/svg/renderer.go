package svg

import (
	"fmt"
	"strings"

	"github.com/Joaopdiasventura/language-count/internal/model"
	"github.com/Joaopdiasventura/language-count/internal/theme"
	"github.com/Joaopdiasventura/language-count/internal/util"
)

func CreateSVG(
	username string,
	languages []model.LanguageBreakdown,
	langsCount int,
	cardWidth int,
	disableAnimations bool,
	state model.CardState,
	themeName string,
) string {
	visibleLanguages := languages
	if len(visibleLanguages) > langsCount {
		visibleLanguages = visibleLanguages[:langsCount]
	}

	width := float64(cardWidth)
	layout := GetCardLayout(width, len(visibleLanguages))
	palette := theme.BuildThemePalette(themeName)
	subtitleLabel := util.TruncateTextToWidth(
		subtitleText(username),
		layout.ContentWidth-util.Round(util.ScaleValue(width, 280, 560, 10, 14)),
		layout.SubtitleSize,
		1.18,
	)
	badgeWidth := minFloat(
		layout.ContentWidth-32,
		maxFloat(104, float64(int(float64(len(state.Badge))*6.1+26+0.5))),
	)
	messageLines := util.WrapText(
		state.Message,
		util.EstimateCharCapacity(layout.ContentWidth-32, layout.SubtitleSize, 1.02),
		2,
	)

	title := "Most used languages card"
	if username != "" {
		title = "Most used languages for " + username
	}

	description := state.Message
	if len(visibleLanguages) > 0 {
		description = fmt.Sprintf(
			"Top %d languages sorted by repository byte count.",
			len(visibleLanguages),
		)
	}

	barGradientDefs := buildBarGradientDefs(visibleLanguages, palette)
	rows := buildRows(visibleLanguages, layout, disableAnimations, palette)
	emptyStateBlock := buildEmptyStateBlock(
		visibleLanguages,
		layout,
		palette,
		state,
		badgeWidth,
		messageLines,
	)

	var builder strings.Builder
	fmt.Fprintf(&builder, `<svg width="%s" height="%s" viewBox="0 0 %s %s" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="cardTitle cardDesc" text-rendering="geometricPrecision" shape-rendering="geometricPrecision">`,
		n(width), n(layout.Height), n(width), n(layout.Height))
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `  <title id="cardTitle">%s</title>`, util.EscapeXML(title))
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `  <desc id="cardDesc">%s</desc>`, util.EscapeXML(description))
	builder.WriteString("\n")
	builder.WriteString("  <style>\n")
	builder.WriteString("    ")
	builder.WriteString(SVGFontFaceCSS)
	builder.WriteString("\n")
	builder.WriteString("  </style>\n")
	builder.WriteString("  <defs>\n")
	fmt.Fprintf(&builder, `    <linearGradient id="cardFill" x1="%s" y1="%s" x2="%s" y2="%s" gradientUnits="userSpaceOnUse">`,
		n(layout.CardX), n(layout.CardY), n(layout.CardX+layout.CardWidth), n(layout.CardY+layout.CardHeight))
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="0%%" stop-color="%s"/>`, palette.CardFillStart)
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="52%%" stop-color="%s"/>`, palette.CardFillMid)
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="100%%" stop-color="%s"/>`, palette.CardFillEnd)
	builder.WriteString("\n")
	builder.WriteString("    </linearGradient>\n")
	fmt.Fprintf(&builder, `    <radialGradient id="ambientGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(%s %s) rotate(145) scale(%s %s)">`,
		n(layout.CardX+layout.CardWidth), n(layout.CardY+layout.CardHeight*0.2), n(layout.CardWidth*0.72), n(layout.CardHeight*0.85))
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="0%%" stop-color="%s"/>`, palette.AmbientInner)
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="42%%" stop-color="%s"/>`, palette.AmbientMid)
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="100%%" stop-color="%s"/>`, palette.AmbientOuter)
	builder.WriteString("\n")
	builder.WriteString("    </radialGradient>\n")
	fmt.Fprintf(&builder, `    <linearGradient id="innerBorder" x1="%s" y1="%s" x2="%s" y2="%s" gradientUnits="userSpaceOnUse">`,
		n(layout.CardX), n(layout.CardY), n(layout.CardX+layout.CardWidth), n(layout.CardY+layout.CardHeight))
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="0%%" stop-color="%s"/>`, palette.BorderStart)
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="55%%" stop-color="%s"/>`, palette.BorderMid)
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="100%%" stop-color="%s"/>`, palette.BorderEnd)
	builder.WriteString("\n")
	builder.WriteString("    </linearGradient>\n")
	fmt.Fprintf(&builder, `    <linearGradient id="topBeam" x1="%s" y1="0" x2="%s" y2="0" gradientUnits="userSpaceOnUse">`,
		n(layout.ContentLeft), n(layout.ContentRight))
	builder.WriteString("\n")
	builder.WriteString(`      <stop offset="0%" stop-color="rgba(255, 255, 255, 0)"/>` + "\n")
	fmt.Fprintf(&builder, `      <stop offset="46%%" stop-color="%s"/>`, palette.TopBeamAccent)
	builder.WriteString("\n")
	builder.WriteString(`      <stop offset="100%" stop-color="rgba(255, 255, 255, 0)"/>` + "\n")
	builder.WriteString("    </linearGradient>\n")
	builder.WriteString(`    <linearGradient id="trackFill" x1="0%" y1="0%" x2="100%" y2="0%">` + "\n")
	fmt.Fprintf(&builder, `      <stop offset="0%%" stop-color="%s"/>`, palette.TrackFillStart)
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="100%%" stop-color="%s"/>`, palette.TrackFillEnd)
	builder.WriteString("\n")
	builder.WriteString("    </linearGradient>\n")
	fmt.Fprintf(&builder, `    <linearGradient id="emptyStateFill" x1="0" y1="0" x2="%s" y2="%s" gradientUnits="userSpaceOnUse">`,
		n(layout.ContentWidth), n(layout.EmptyPanelHeight))
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="0%%" stop-color="%s"/>`, palette.EmptyStateFillStart)
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="100%%" stop-color="%s"/>`, palette.EmptyStateFillEnd)
	builder.WriteString("\n")
	builder.WriteString("    </linearGradient>\n")
	fmt.Fprintf(&builder, `    <linearGradient id="shardFill" x1="%s" y1="%s" x2="%s" y2="%s" gradientUnits="userSpaceOnUse">`,
		n(layout.DecorationX), n(layout.DecorationY), n(layout.DecorationX+layout.DecorationWidth), n(layout.DecorationY+layout.DecorationHeight))
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="0%%" stop-color="%s"/>`, palette.ShardStart)
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <stop offset="58%%" stop-color="%s"/>`, palette.ShardMid)
	builder.WriteString("\n")
	builder.WriteString(`      <stop offset="100%" stop-color="rgba(255, 255, 255, 0)"/>` + "\n")
	builder.WriteString("    </linearGradient>\n")
	builder.WriteString(`    <clipPath id="cardClip">` + "\n")
	fmt.Fprintf(&builder, `      <rect x="%s" y="%s" width="%s" height="%s" rx="%s"/>`,
		n(layout.CardX), n(layout.CardY), n(layout.CardWidth), n(layout.CardHeight), n(layout.CardRadius))
	builder.WriteString("\n")
	builder.WriteString("    </clipPath>\n")
	builder.WriteString(`    <clipPath id="headerClip">` + "\n")
	fmt.Fprintf(&builder, `      <rect x="%s" y="%s" width="%s" height="%s" rx="0"/>`,
		n(layout.ContentLeft), n(layout.CardY), n(layout.ContentWidth), n(layout.DividerY-layout.CardY+2))
	builder.WriteString("\n")
	builder.WriteString("    </clipPath>\n")
	builder.WriteString(`    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">` + "\n")
	fmt.Fprintf(&builder, `      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="%s"/>`, palette.ShadowBase)
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="%s"/>`, palette.ShadowAccent)
	builder.WriteString("\n")
	builder.WriteString("    </filter>\n")
	builder.WriteString("    ")
	builder.WriteString(barGradientDefs)
	builder.WriteString("\n")
	builder.WriteString("  </defs>\n\n")
	builder.WriteString(`  <g filter="url(#cardShadow)">` + "\n")
	fmt.Fprintf(&builder, `    <rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s"/>`,
		n(layout.CardX), n(layout.CardY), n(layout.CardWidth), n(layout.CardHeight), n(layout.CardRadius),
		util.MixHexColors(palette.CardFillEnd, "#000000", 0.28))
	builder.WriteString("\n")
	builder.WriteString("  </g>\n")
	builder.WriteString(`  <g clip-path="url(#cardClip)">` + "\n")
	fmt.Fprintf(&builder, `    <rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="url(#cardFill)"/>`,
		n(layout.CardX), n(layout.CardY), n(layout.CardWidth), n(layout.CardHeight), n(layout.CardRadius))
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `    <rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="url(#ambientGlow)"/>`,
		n(layout.CardX), n(layout.CardY), n(layout.CardWidth), n(layout.CardHeight), n(layout.CardRadius))
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `    <path d="M%s %sC%s %s %s %s %s %sV%sH%sZ" fill="%s"/>`,
		n(layout.CardX), n(layout.CardY+layout.CardHeight*0.16),
		n(layout.CardX+layout.CardWidth*0.38), n(layout.CardY+layout.CardHeight*0.1),
		n(layout.CardX+layout.CardWidth*0.72), n(layout.CardY+layout.CardHeight*0.24),
		n(layout.CardX+layout.CardWidth), n(layout.CardY+layout.CardHeight*0.12),
		n(layout.CardY), n(layout.CardX), palette.BgWave)
	builder.WriteString("\n\n")
	builder.WriteString(`    <g opacity="0.58">` + "\n")
	fmt.Fprintf(&builder, `      <path d="M%s %sL%s %sL%s %sL%s %sZ" fill="url(#shardFill)"/>`,
		n(layout.DecorationX+4), n(layout.DecorationY+6),
		n(layout.DecorationX+layout.DecorationWidth), n(layout.DecorationY+24),
		n(layout.DecorationX+layout.DecorationWidth-26), n(layout.DecorationY+layout.DecorationHeight),
		n(layout.DecorationX-6), n(layout.DecorationY+layout.DecorationHeight-18))
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <path d="M%s %sL%s %sL%s %sL%s %sZ" fill="%s"/>`,
		n(layout.DecorationX+24), n(layout.DecorationY+12),
		n(layout.DecorationX+layout.DecorationWidth-18), n(layout.DecorationY+26),
		n(layout.DecorationX+layout.DecorationWidth-34), n(layout.DecorationY+layout.DecorationHeight-10),
		n(layout.DecorationX+12), n(layout.DecorationY+layout.DecorationHeight-22),
		palette.ShardInner)
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `      <path d="M%s %sL%s %s" stroke="%s"/>`,
		n(layout.DecorationX+10), n(layout.DecorationY+layout.DecorationHeight-18),
		n(layout.DecorationX+layout.DecorationWidth-26), n(layout.DecorationY+layout.DecorationHeight),
		palette.ShardLine)
	builder.WriteString("\n")
	builder.WriteString("    </g>\n\n")
	fmt.Fprintf(&builder, `    <path d="M%s %sH%s" stroke="url(#topBeam)" stroke-width="1.15" stroke-linecap="round"/>`,
		n(layout.ContentLeft), n(layout.CardY+1.5), n(layout.ContentRight))
	builder.WriteString("\n")
	builder.WriteString("  </g>\n\n")
	fmt.Fprintf(&builder, `  <rect x="%s" y="%s" width="%s" height="%s" rx="%s" stroke="url(#innerBorder)"/>`,
		n(layout.CardX), n(layout.CardY), n(layout.CardWidth), n(layout.CardHeight), n(layout.CardRadius))
	builder.WriteString("\n")
	fmt.Fprintf(&builder, `  <rect x="%s" y="%s" width="%s" height="%s" rx="%s" stroke="%s"/>`,
		n(layout.CardX+1), n(layout.CardY+1), n(layout.CardWidth-2), n(layout.CardHeight-2), n(maxFloat(0, layout.CardRadius-1)), palette.InnerStroke)
	builder.WriteString("\n\n")
	builder.WriteString(`  <g clip-path="url(#headerClip)">` + "\n")
	fmt.Fprintf(&builder, `    <text x="%s" y="%s" fill="%s" font-size="%s" font-weight="700" font-family="%s" letter-spacing="0.18em">`,
		n(layout.ContentLeft), n(layout.EyebrowY), palette.Eyebrow, n(layout.EyebrowSize), SVGFontStack)
	builder.WriteString("\n")
	builder.WriteString("      LANGUAGE PROFILE\n")
	builder.WriteString("    </text>\n")
	fmt.Fprintf(&builder, `    <text x="%s" y="%s" fill="%s" font-size="%s" font-weight="700" font-family="%s">`,
		n(layout.ContentLeft), n(layout.TitleY), palette.Title, n(layout.TitleSize), SVGFontStack)
	builder.WriteString("\n")
	builder.WriteString("      Most Used Languages\n")
	builder.WriteString("    </text>\n")
	fmt.Fprintf(&builder, `    <text x="%s" y="%s" fill="%s" font-size="%s" font-family="%s">`,
		n(layout.ContentLeft), n(layout.SubtitleY), palette.Subtitle, n(layout.SubtitleSize), SVGFontStack)
	builder.WriteString("\n")
	builder.WriteString("      " + util.EscapeXML(subtitleLabel) + "\n")
	builder.WriteString("    </text>\n")
	fmt.Fprintf(&builder, `    <path d="M%s %sH%s" stroke="%s" stroke-linecap="round"/>`,
		n(layout.ContentLeft), n(layout.DividerY), n(layout.ContentRight), palette.TrackStroke)
	builder.WriteString("\n")
	builder.WriteString("  </g>\n\n")
	builder.WriteString(`  <g clip-path="url(#cardClip)">` + "\n")
	builder.WriteString("    ")
	builder.WriteString(rows)
	builder.WriteString("\n")
	builder.WriteString("    ")
	builder.WriteString(emptyStateBlock)
	builder.WriteString("\n")
	builder.WriteString("  </g>\n")
	builder.WriteString("</svg>")

	return builder.String()
}

func buildBarGradientDefs(languages []model.LanguageBreakdown, palette theme.Palette) string {
	if len(languages) == 0 {
		return ""
	}

	parts := make([]string, 0, len(languages))
	for index, item := range languages {
		color := theme.GetLanguageColor(item.Language)
		themedBase := util.MixHexColors(color, palette.Accent, palette.LanguageTint)
		start := util.MixHexColors(themedBase, "#ffffff", 0.14)
		end := util.MixHexColors(themedBase, palette.AccentDeep, 0.18)
		parts = append(parts, strings.TrimSpace(fmt.Sprintf(`
<linearGradient id="barGradient%d" x1="0%%" y1="0%%" x2="100%%" y2="0%%">
      <stop offset="0%%" stop-color="%s"/>
      <stop offset="55%%" stop-color="%s"/>
      <stop offset="100%%" stop-color="%s"/>
    </linearGradient>
`, index, start, themedBase, end)))
	}

	return strings.Join(parts, "\n")
}

func buildRows(
	languages []model.LanguageBreakdown,
	layout CardLayout,
	disableAnimations bool,
	palette theme.Palette,
) string {
	if len(languages) == 0 {
		return ""
	}

	rows := make([]string, 0, len(languages))
	for index, item := range languages {
		rows = append(rows, buildRowSVG(item, index, layout, disableAnimations, palette))
	}

	return strings.Join(rows, "\n")
}

func buildRowSVG(
	item model.LanguageBreakdown,
	index int,
	layout CardLayout,
	disableAnimations bool,
	palette theme.Palette,
) string {
	color := theme.GetLanguageColor(item.Language)
	percentageLabel := util.FormatPercentage(item.Percentage)
	renderedBarWidth := 0.0
	if item.Percentage > 0 {
		renderedBarWidth = maxFloat(
			layout.TrackHeight,
			util.Round((item.Percentage/100)*layout.TrackWidth),
		)
	}

	labelMaxChars := util.EstimateCharCapacity(layout.LabelMaxWidth, layout.LabelSize, 0.86)
	label := util.TruncateText(item.Language, labelMaxChars)
	beginMS := 110 + index*70
	fillBeginMS := beginMS + 90
	rowTop := util.Round(layout.RowsStartY + float64(index)*layout.RowStep)
	highlightWidth := 0.0
	if renderedBarWidth > 0 {
		highlightWidth = maxFloat(0, renderedBarWidth-1.2)
	}

	openGroup := fmt.Sprintf(`<g transform="translate(%s %s)">`, n(layout.ContentLeft), n(rowTop))
	if !disableAnimations {
		openGroup = fmt.Sprintf(`<g transform="translate(%s %s)" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="360ms" begin="%dms" fill="freeze"/>
      `, n(layout.ContentLeft), n(rowTop), beginMS)
	}

	fillRect := fmt.Sprintf(`<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="url(#barGradient%d)"/>`,
		n(layout.TrackX), n(layout.TrackY), n(renderedBarWidth), n(layout.TrackHeight), n(layout.TrackRadius), index)
	if !disableAnimations {
		fillRect = fmt.Sprintf(`<rect x="%s" y="%s" width="0" height="%s" rx="%s" fill="url(#barGradient%d)">
        <animate attributeName="width" from="0" to="%s" dur="680ms" begin="%dms" fill="freeze"/>
      </rect>`,
			n(layout.TrackX), n(layout.TrackY), n(layout.TrackHeight), n(layout.TrackRadius), index, n(renderedBarWidth), fillBeginMS)
	}

	highlight := ""
	if highlightWidth > 0 {
		highlight = fmt.Sprintf(`<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s"/>`,
			n(layout.TrackX+0.6), n(layout.TrackY+0.7), n(highlightWidth), n(maxFloat(1.2, layout.TrackHeight*0.34)), n(maxFloat(0.6, layout.TrackRadius-0.6)), palette.BarHighlight)
	}

	return strings.TrimSpace(fmt.Sprintf(`
%s
        <circle cx="%s" cy="%s" r="%s" fill="%s" stroke="%s" stroke-width="0.9"/>
        <text x="%s" y="%s" fill="%s" font-size="%s" font-weight="600" font-family="%s" dominant-baseline="middle">
          %s
        </text>
        <text x="%s" y="%s" fill="%s" font-size="%s" font-weight="500" font-family="%s" text-anchor="end" dominant-baseline="middle" font-variant-numeric="tabular-nums">
          %s
        </text>
        <rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="url(#trackFill)" stroke="%s" stroke-width="0.8"/>
        %s
        %s
      </g>
`, openGroup, n(layout.DotRadius), n(layout.RowBaselineY), n(layout.DotRadius), color, palette.RowDotStroke,
		n(layout.LabelX), n(layout.RowBaselineY), palette.Label, n(layout.LabelSize), SVGFontStack, util.EscapeXML(label),
		n(layout.PercentageX), n(layout.RowBaselineY), palette.Metric, n(layout.PercentageSize), SVGFontStack, percentageLabel,
		n(layout.TrackX), n(layout.TrackY), n(layout.TrackWidth), n(layout.TrackHeight), n(layout.TrackRadius), palette.TrackStroke,
		fillRect, highlight))
}

func buildEmptyStateBlock(
	visibleLanguages []model.LanguageBreakdown,
	layout CardLayout,
	palette theme.Palette,
	state model.CardState,
	badgeWidth float64,
	messageLines []string,
) string {
	if len(visibleLanguages) > 0 {
		return ""
	}

	lines := make([]string, 0, len(messageLines))
	for lineIndex, line := range messageLines {
		lines = append(lines, strings.TrimSpace(fmt.Sprintf(`
<text x="16" y="%d" fill="%s" font-size="%s" font-family="%s">
        %s
      </text>`, 78+lineIndex*16, palette.Subtitle, n(layout.SubtitleSize), SVGFontStack, util.EscapeXML(line))))
	}

	messageBlock := strings.Join(lines, "\n")

	return strings.TrimSpace(fmt.Sprintf(`
<g transform="translate(%s %s)">
      <rect width="%s" height="%s" rx="18" fill="url(#emptyStateFill)" stroke="%s"/>
      <rect x="16" y="16" width="%s" height="22" rx="999" fill="%s" stroke="%s"/>
      <text x="30" y="31" fill="%s" font-size="9.5" font-weight="700" font-family="%s" letter-spacing="0.12em">
        %s
      </text>
      <text x="16" y="58" fill="%s" font-size="%s" font-weight="700" font-family="%s">
        %s
      </text>
      %s
    </g>
`, n(layout.ContentLeft), n(layout.RowsStartY+2), n(layout.ContentWidth), n(layout.EmptyPanelHeight), palette.EmptyStateBorder,
		n(badgeWidth), palette.BadgeFill, palette.BadgeStroke, palette.BadgeText, SVGFontStack, util.EscapeXML(state.Badge),
		palette.EmptyTitle, n(layout.TitleSize-1), SVGFontStack, util.EscapeXML(state.Title), messageBlock))
}

func subtitleText(username string) string {
	if username == "" {
		return "GitHub code distribution for your profile"
	}

	return "GitHub code distribution for @" + username
}

func n(value float64) string {
	return util.NumberString(value)
}

func minFloat(left, right float64) float64 {
	if left < right {
		return left
	}

	return right
}

func maxFloat(left, right float64) float64 {
	if left > right {
		return left
	}

	return right
}
