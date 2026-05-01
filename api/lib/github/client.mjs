import { GITHUB_API } from "../constants.mjs";

export function buildGitHubHeaders(accessToken) {
  return {
    Accept: "application/vnd.github+json",
    ...(accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : {}),
  };
}

async function readJsonResponse(response) {
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data: null,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: await response.json(),
  };
}

export function createGitHubClient({
  accessToken = process.env.GITHUB_TOKEN,
  fetchImpl = globalThis.fetch,
} = {}) {
  const headers = buildGitHubHeaders(accessToken);

  if (typeof fetchImpl !== "function") {
    throw new TypeError("A fetch implementation is required.");
  }

  return {
    headers,
    async fetchOwnerRepositories(username) {
      const response = await fetchImpl(
        `${GITHUB_API}/users/${username}/repos?per_page=100&type=owner`,
        {
          headers,
        },
      );

      return readJsonResponse(response);
    },
    async fetchRepositoryLanguages(languagesUrl) {
      const response = await fetchImpl(languagesUrl, {
        headers,
      });

      return readJsonResponse(response);
    },
  };
}
