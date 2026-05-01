const GITHUB_API = 'https://api.github.com'

const HIDDEN_LANGUAGES = [
  'HTML',
  'CSS',
  'SCSS',
  'Less',
  'Blade',
  'Dockerfile',
  'Shell',
  'Batchfile',
  'PowerShell',
  'Makefile',
]

const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Go: '#00add8',
  Java: '#b07219',
  Python: '#3572A5',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Rust: '#dea584',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Dart: '#00B4AB',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Lua: '#000080',
  SQL: '#e38c00',
}

function getColor(language) {
  return LANGUAGE_COLORS[language] || '#8b949e'
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function createSvg(username, languages) {
  const width = 720
  const rowHeight = 42
  const headerHeight = 74
  const footerHeight = 26
  const visibleLanguages = languages.slice(0, 8)
  const height = headerHeight + visibleLanguages.length * rowHeight + footerHeight

  let rows = ''
  let bars = ''
  let offset = 0

  for (const item of visibleLanguages) {
    const color = getColor(item.language)
    const barWidth = Math.max(6, (item.percentage / 100) * 560)
    const y = headerHeight + offset * rowHeight

    rows += `
      <g transform="translate(32 ${y})" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="400ms" begin="${offset * 90}ms" fill="freeze"/>
        <circle cx="8" cy="12" r="6" fill="${color}"/>
        <text x="24" y="17" fill="#c9d1d9" font-size="15" font-family="Inter, Segoe UI, Arial">${escapeXml(item.language)}</text>
        <text x="628" y="17" fill="#8b949e" font-size="14" font-family="Inter, Segoe UI, Arial" text-anchor="end">${item.percentage}%</text>
        <rect x="24" y="27" width="560" height="7" rx="4" fill="#21262d"/>
        <rect x="24" y="27" width="0" height="7" rx="4" fill="${color}">
          <animate attributeName="width" from="0" to="${barWidth}" dur="700ms" begin="${offset * 90 + 180}ms" fill="freeze"/>
        </rect>
      </g>
    `

    bars += `
      <rect x="${80 + offset}" y="${height - 16}" width="0" height="5" rx="3" fill="${color}">
        <animate attributeName="width" from="0" to="${Math.max(12, item.percentage * 4.8)}" dur="800ms" begin="${offset * 100 + 120}ms" fill="freeze"/>
      </rect>
    `

    offset += 1
  }

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    @keyframes glow {
      0%, 100% { filter: drop-shadow(0 0 0 rgba(88,166,255,0)); }
      50% { filter: drop-shadow(0 0 10px rgba(88,166,255,0.24)); }
    }

    .card {
      animation: glow 4s ease-in-out infinite;
    }
  </style>

  <rect class="card" x="1" y="1" width="${width - 2}" height="${height - 2}" rx="18" fill="#0d1117" stroke="#30363d"/>
  <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="14" fill="#161b22" stroke="#21262d"/>

  <text x="32" y="45" fill="#f0f6fc" font-size="22" font-weight="700" font-family="Inter, Segoe UI, Arial">
    Most Used Languages
  </text>

  <text x="32" y="66" fill="#8b949e" font-size="13" font-family="Inter, Segoe UI, Arial">
    GitHub language distribution for ${escapeXml(username)}
  </text>

  ${rows}

  ${bars}
</svg>
`.trim()
}

export default async function handler(req, res) {
  try {
    const username = String(req.query.username || '').trim()

    if (!username) {
      res.setHeader('Content-Type', 'image/svg+xml')
      return res.status(400).send(createSvg('unknown', []))
    }

    const hiddenLanguages = new Set([
      ...HIDDEN_LANGUAGES,
      ...(req.query.hide
        ? String(req.query.hide)
            .split(',')
            .map((language) => language.trim())
            .filter(Boolean)
        : []),
    ])

    const githubHeaders = {
      Accept: 'application/vnd.github+json',
      ...(process.env.GITHUB_TOKEN
        ? {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }
        : {}),
    }

    const reposResponse = await fetch(
      `${GITHUB_API}/users/${username}/repos?per_page=100&type=owner`,
      {
        headers: githubHeaders,
      },
    )

    if (!reposResponse.ok) {
      res.setHeader('Content-Type', 'image/svg+xml')
      return res.status(reposResponse.status).send(createSvg(username, []))
    }

    const repos = await reposResponse.json()
    const languageTotals = {}

    await Promise.all(
      repos
        .filter((repo) => !repo.fork)
        .map(async (repo) => {
          const response = await fetch(repo.languages_url, {
            headers: githubHeaders,
          })

          if (!response.ok) {
            return
          }

          const languages = await response.json()

          for (const [language, bytes] of Object.entries(languages)) {
            if (hiddenLanguages.has(language)) {
              continue
            }

            languageTotals[language] = (languageTotals[language] || 0) + bytes
          }
        }),
    )

    const totalBytes = Object.values(languageTotals).reduce(
      (acc, value) => acc + value,
      0,
    )

    const languages = Object.entries(languageTotals)
      .map(([language, bytes]) => ({
        language,
        bytes,
        percentage: totalBytes
          ? Number(((bytes / totalBytes) * 100).toFixed(2))
          : 0,
      }))
      .sort((a, b) => b.bytes - a.bytes)

    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')

    return res.status(200).send(createSvg(username, languages))
  } catch {
    res.setHeader('Content-Type', 'image/svg+xml')
    return res.status(500).send(createSvg('error', []))
  }
}