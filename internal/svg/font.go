package svg

import (
	_ "embed"
	"encoding/base64"
	"fmt"
	"strings"
)

//go:embed assets/Azonix.otf
var azonixFont []byte

const svgFontFamily = "Azonix"

var SVGFontStack = "'" + svgFontFamily + "', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

var SVGFontFaceCSS = strings.TrimSpace(fmt.Sprintf(`
@font-face {
  font-family: '%s';
  src: url(data:font/otf;base64,%s) format('opentype');
  font-style: normal;
  font-weight: 400;
}
`, svgFontFamily, base64.StdEncoding.EncodeToString(azonixFont)))
