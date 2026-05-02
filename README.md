<div align="center">

[![Vercel](https://img.shields.io/badge/Vercel-Go%20Function-black?logo=vercel)](https://vercel.com/)
[![Output](https://img.shields.io/badge/output-SVG%20card-a87770)](https://developer.mozilla.org/en-US/docs/Web/SVG)
[![Data Source](https://img.shields.io/badge/data-GitHub%20API-181717?logo=github)](https://docs.github.com/en/rest)
[![Runtime](https://img.shields.io/badge/runtime-Go%20only-1f7a5c)](./api/)
[![License](https://img.shields.io/badge/license-ISC-2d7ff9)](./LICENSE)

</div>

# Language Count

Language Count is a Go-based GitHub language card that renders a single deterministic SVG image from one HTTP endpoint. The production deployment is Go-only on Vercel.

[Português (Brasil)](./README.pt-BR.md)

## What It Does

The endpoint aggregates GitHub repository language byte counts and renders a README-friendly SVG card.

Behavior preserved from the original implementation:

- one public endpoint
- one SVG response format
- same query parameter contract
- same fallback/error-state cards
- same GitHub API collection semantics
- same cache policy
- same theme and animation behavior

## Live Usage

Base endpoint:

```text
https://language-count.joaopdias.dev.br/
```

Real example:

```text
https://language-count.joaopdias.dev.br/?username=Joaopdiasventura
```

README embed:

```md
![Most Used Languages](https://language-count.joaopdias.dev.br/?username=Joaopdiasventura)
```

## Query Parameters

| Parameter | Type | Default | Range / Format | Notes |
| --- | --- | --- | --- | --- |
| `username` | string | none | GitHub username | Required. |
| `hide` | comma-separated string | none | `html,css,shell` | Case-insensitive. Extends the built-in hidden-language set. |
| `langs_count` | integer | `6` | `1-20` | Maximum rendered languages. |
| `limit` | integer | none | `1-20` | Legacy alias. Takes precedence over `langs_count` when non-empty. |
| `card_width` | integer | `360` | `280-560` | SVG width in pixels. Height is computed from layout. |
| `theme` | string | `red` | `red`, `blue`, `yellow`, `purple`, `green`, `white` | Case-insensitive. Invalid values fall back to `red`. |
| `disable_animations` | boolean | `false` | `true`, `false`, `1`, `0` | Only `true` and `1` enable static rendering. |

Repeated query parameters keep the first value, matching the legacy implementation.

## Production Architecture

```text
.
├─ api/
│  └─ index.go
├─ cmd/
│  └─ langcount/
│     └─ main.go
├─ internal/
│  ├─ githubapi/
│  ├─ httpapi/
│  ├─ model/
│  ├─ pipeline/
│  ├─ svg/
│  ├─ theme/
│  └─ util/
├─ go.mod
└─ vercel.json
```

### Request flow

1. Parse query parameters with the same normalization and clamping rules as the legacy JS path.
2. Fetch `GET /users/{username}/repos?per_page=100&type=owner`.
3. Ignore forked repositories.
4. Fetch each `languages_url` concurrently with shared `context.Context`.
5. Skip non-2xx per-repository language responses without failing the request.
6. Abort the request on transport or decode failures, matching legacy error semantics.
7. Aggregate bytes with deterministic repo-order tie handling.
8. Render a self-contained SVG with the embedded Azonix font and theme-aware gradients.

### Package responsibilities

- `internal/httpapi`: request parsing, state selection, response headers, top-level error handling.
- `internal/githubapi`: GitHub HTTP client, upstream header policy, ordered JSON decoding.
- `internal/pipeline`: hidden-language filtering, concurrent collection, deterministic aggregation.
- `internal/svg`: layout math, font embedding, SVG string assembly.
- `internal/theme`: theme palettes and language-color mapping.
- `internal/util`: JS-compatible text, math, and color helpers.

## Compatibility Guarantees

The migration target was runtime replacement, not product redesign.

Guaranteed preserved behavior:

- HTTP status codes
- `Content-Type` and success-only `Cache-Control`
- SVG element structure and fallback message copy
- query parameter behavior, including edge-case parsing quirks
- hidden-language defaults
- theme selection and animation toggling
- first-page-only repository enumeration
- fork exclusion
- per-repo non-2xx language fetch skip behavior

Deterministic improvement applied intentionally:

- equal-byte language ties are now resolved by repository enumeration order instead of request-race order

This was the only compatibility policy change accepted during planning, and it exists to eliminate nondeterministic output in tie scenarios while preserving the original data semantics.

## Development

Run the local Go server:

```bash
go run ./cmd/langcount
```

Default local URL:

```text
http://localhost:3000/?username=Joaopdiasventura
```

Optional environment variable:

| Variable | Required | Description |
| --- | --- | --- |
| `GITHUB_TOKEN` | No | Used for authenticated GitHub API requests. |

## Validation And Testing

Core test suite:

```bash
go test ./...
```

Behavior regression suite:

```bash
go test ./internal/httpapi -run TestAppScenarios -v
```

Representative frozen outputs:

```bash
go test ./internal/httpapi -run TestRepresentativeGoldenChecksums -v
```

Benchmarks:

```bash
go test -run ^$ -bench . ./internal/pipeline ./internal/svg
```

Current sample benchmark output from this migration pass on `windows/amd64`:

```text
BenchmarkAggregateRepositoryLanguages-12    57764    21279 ns/op    5356 B/op    110 allocs/op
BenchmarkCreateSVG-12                        6302   199596 ns/op  177367 B/op   1038 allocs/op
```

Race detection:

```bash
go test -race ./...
```

On Windows this requires a C toolchain. In the current local environment, the command could not run because `gcc` was not installed.

## Deployment

`vercel.json` routes all incoming paths to the Go handler and keeps the original `maxDuration: 10` budget.

Deploy with the Vercel dashboard or CLI:

```bash
vercel
vercel --prod
```

## Notes

- The SVG stays self-contained and image-safe in error scenarios.
- The embedded font is loaded once at startup through Go embedding, not read from disk per request.
- The repository is now fully Go-only; the legacy migration scaffolding was removed after the outputs were frozen in tests.
