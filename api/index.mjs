const GITHUB_API = "https://api.github.com";

const HIDDEN_LANGUAGES = [
  "HTML",
  "CSS",
  "SCSS",
  "Less",
  "Blade",
  "Dockerfile",
  "Shell",
  "Batchfile",
  "PowerShell",
  "Makefile",
];

export default async function handler(req, res) {
  try {
    const username = String(req.query.username || "").trim();

    if (!username)
      return res.status(400).json({
        error: "username is required",
      });

    const hiddenLanguages = [
      ...HIDDEN_LANGUAGES,
      ...(req.query.hide
        ? String(req.query.hide)
            .split(",")
            .map((language) => language.trim())
        : []),
    ];

    const reposResponse = await fetch(
      `${GITHUB_API}/users/${username}/repos?per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(process.env.GITHUB_TOKEN
            ? {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              }
            : {}),
        },
      },
    );

    if (!reposResponse.ok)
      return res.status(reposResponse.status).json({
        error: "failed to fetch repositories",
      });

    const repos = await reposResponse.json();

    const languageTotals = {};

    await Promise.all(
      repos
        .filter((repo) => !repo.fork)
        .map(async (repo) => {
          const response = await fetch(repo.languages_url, {
            headers: {
              Accept: "application/vnd.github+json",
              ...(process.env.GITHUB_TOKEN
                ? {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                  }
                : {}),
            },
          });

          if (!response.ok) return;

          const languages = await response.json();

          for (const [language, bytes] of Object.entries(languages)) {
            if (hiddenLanguages.includes(language)) continue;

            languageTotals[language] = (languageTotals[language] || 0) + bytes;
          }
        }),
    );

    const totalBytes = Object.values(languageTotals).reduce(
      (acc, value) => acc + value,
      0,
    );

    const result = Object.entries(languageTotals)
      .map(([language, bytes]) => ({
        language,
        bytes,
        percentage: Number(((bytes / totalBytes) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.bytes - a.bytes);

    return res.status(200).json({
      username,
      hiddenLanguages,
      totalBytes,
      languages: result,
    });
  } catch {
    return res.status(500).json({
      error: "internal server error",
    });
  }
}
