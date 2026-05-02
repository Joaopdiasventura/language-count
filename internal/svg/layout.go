package svg

import (
	"math"

	"github.com/Joaopdiasventura/language-count/internal/util"
)

type CardLayout struct {
	OuterInset       float64
	CardX            float64
	CardY            float64
	CardWidth        float64
	CardHeight       float64
	CardRadius       float64
	ContentLeft      float64
	ContentRight     float64
	ContentWidth     float64
	EyebrowSize      float64
	TitleSize        float64
	SubtitleSize     float64
	LabelSize        float64
	PercentageSize   float64
	EyebrowY         float64
	TitleY           float64
	SubtitleY        float64
	DividerY         float64
	RowsStartY       float64
	DotRadius        float64
	RowBaselineY     float64
	RowStep          float64
	TrackY           float64
	TrackHeight      float64
	TrackRadius      float64
	LabelX           float64
	LabelMaxWidth    float64
	TrackX           float64
	TrackWidth       float64
	PercentageX      float64
	BottomInset      float64
	EmptyPanelHeight float64
	Height           float64
	DecorationX      float64
	DecorationY      float64
	DecorationWidth  float64
	DecorationHeight float64
}

func GetCardLayout(width float64, visibleCount int) CardLayout {
	outerInset := util.Round(util.ScaleValue(width, 280, 560, 10, 14))
	cardX := outerInset
	cardY := outerInset
	cardWidth := width - outerInset*2
	contentInsetX := util.Round(util.ScaleValue(width, 280, 560, 18, 28))
	contentLeft := cardX + contentInsetX
	contentRight := cardX + cardWidth - contentInsetX
	contentWidth := contentRight - contentLeft
	eyebrowSize := util.Round(util.ScaleValue(width, 280, 560, 8.8, 10.4))
	titleSize := util.Round(util.ScaleValue(width, 280, 560, 18.5, 23.5))
	subtitleSize := util.Round(util.ScaleValue(width, 280, 560, 9.4, 11))
	labelSize := util.Round(util.ScaleValue(width, 280, 560, 10.8, 12.8))
	percentageSize := util.Round(util.ScaleValue(width, 280, 560, 10.2, 11.8))
	topInset := util.Round(util.ScaleValue(width, 280, 560, 18, 22))
	eyebrowY := cardY + topInset + eyebrowSize
	titleY := eyebrowY + util.Round(util.ScaleValue(width, 280, 560, 20, 23))
	subtitleY := titleY + util.Round(util.ScaleValue(width, 280, 560, 18, 20))
	dividerY := subtitleY + util.Round(util.ScaleValue(width, 280, 560, 16, 18))
	rowsStartY := dividerY + util.Round(util.ScaleValue(width, 280, 560, 14, 18))
	dotRadius := util.Round(util.ScaleValue(width, 280, 560, 3.8, 4.6))
	rowBaselineY := util.Round(util.ScaleValue(width, 280, 560, 6.4, 7.2))
	rowStep := util.Round(util.ScaleValue(width, 280, 560, 34, 39))
	trackY := util.Round(util.ScaleValue(width, 280, 560, 15.5, 17.5))
	trackHeight := util.Round(util.ScaleValue(width, 280, 560, 5.2, 6.2))
	trackRadius := util.Round(trackHeight / 2)
	labelX := util.Round(dotRadius*2 + util.ScaleValue(width, 280, 560, 7, 9))
	percentageReserve := util.Round(util.ScaleValue(width, 280, 560, 56, 74))
	labelRight := contentWidth - percentageReserve
	labelMaxWidth := labelRight - labelX
	trackX := labelX
	trackWidth := contentWidth - trackX
	rowVisualHeight := trackY + trackHeight
	bottomInset := util.Round(util.ScaleValue(width, 280, 560, 18, 22))
	emptyPanelHeight := util.Round(util.ScaleValue(width, 280, 560, 94, 108))
	rowsHeight := emptyPanelHeight
	if visibleCount > 0 {
		rowsHeight = float64(visibleCount-1)*rowStep + rowVisualHeight
	}

	cardBottom := rowsStartY + rowsHeight + bottomInset
	height := math.Ceil(cardBottom + outerInset)
	cardHeight := height - outerInset*2
	cardRadius := util.Round(util.ScaleValue(width, 280, 560, 18, 22))
	decorationWidth := util.Round(util.ScaleValue(width, 280, 560, 72, 112))
	decorationHeight := util.Round(util.ScaleValue(width, 280, 560, 64, 92))
	decorationX := contentRight - decorationWidth + util.Round(util.ScaleValue(width, 280, 560, 8, 6))
	decorationY := cardY + util.Round(util.ScaleValue(width, 280, 560, 12, 18))

	return CardLayout{
		OuterInset:       outerInset,
		CardX:            cardX,
		CardY:            cardY,
		CardWidth:        cardWidth,
		CardHeight:       cardHeight,
		CardRadius:       cardRadius,
		ContentLeft:      contentLeft,
		ContentRight:     contentRight,
		ContentWidth:     contentWidth,
		EyebrowSize:      eyebrowSize,
		TitleSize:        titleSize,
		SubtitleSize:     subtitleSize,
		LabelSize:        labelSize,
		PercentageSize:   percentageSize,
		EyebrowY:         eyebrowY,
		TitleY:           titleY,
		SubtitleY:        subtitleY,
		DividerY:         dividerY,
		RowsStartY:       rowsStartY,
		DotRadius:        dotRadius,
		RowBaselineY:     rowBaselineY,
		RowStep:          rowStep,
		TrackY:           trackY,
		TrackHeight:      trackHeight,
		TrackRadius:      trackRadius,
		LabelX:           labelX,
		LabelMaxWidth:    labelMaxWidth,
		TrackX:           trackX,
		TrackWidth:       trackWidth,
		PercentageX:      contentWidth,
		BottomInset:      bottomInset,
		EmptyPanelHeight: emptyPanelHeight,
		Height:           height,
		DecorationX:      decorationX,
		DecorationY:      decorationY,
		DecorationWidth:  decorationWidth,
		DecorationHeight: decorationHeight,
	}
}
