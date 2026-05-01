import { SVG_CACHE_CONTROL, SVG_CONTENT_TYPE } from "./constants.mjs";
import { buildState } from "./card-state.mjs";
import { createGitHubClient } from "./github/client.mjs";
import {
  aggregateRepositoryLanguages,
  buildHiddenLanguageSet,
  calculateLanguageBreakdown,
} from "./languages/service.mjs";
import { parseRequestOptions } from "./query-params.mjs";
import { createSvg } from "./svg/renderer.mjs";

function sendSvgResponse(res, statusCode, svg, { cacheable = false } = {}) {
  res.setHeader("Content-Type", SVG_CONTENT_TYPE);

  if (cacheable) {
    res.setHeader("Cache-Control", SVG_CACHE_CONTROL);
  }

  return res.status(statusCode).send(svg);
}

export async function handleCardRequest(
  req,
  res,
  {
    fetchImpl = globalThis.fetch,
    accessToken = process.env.GITHUB_TOKEN,
  } = {},
) {
  const { username, hide, langsCount, cardWidth, disableAnimations, themeName } =
    parseRequestOptions(req.query ?? {});

  try {
    if (!username) {
      return sendSvgResponse(
        res,
        400,
        createSvg({
          username: "",
          languages: [],
          langsCount,
          cardWidth,
          disableAnimations,
          state: buildState("missing-username"),
          themeName,
        }),
      );
    }

    const githubClient = createGitHubClient({
      accessToken,
      fetchImpl,
    });
    const repositoriesResponse = await githubClient.fetchOwnerRepositories(
      username,
    );

    if (!repositoriesResponse.ok) {
      return sendSvgResponse(
        res,
        repositoriesResponse.status,
        createSvg({
          username,
          languages: [],
          langsCount,
          cardWidth,
          disableAnimations,
          state: buildState("github-error", repositoriesResponse.status),
          themeName,
        }),
      );
    }

    const hiddenLanguages = buildHiddenLanguageSet(hide);
    const languageTotals = await aggregateRepositoryLanguages({
      repositories: repositoriesResponse.data,
      githubClient,
      hiddenLanguages,
    });
    const languages = calculateLanguageBreakdown(languageTotals);

    return sendSvgResponse(
      res,
      200,
      createSvg({
        username,
        languages,
        langsCount,
        cardWidth,
        disableAnimations,
        state: buildState("empty-languages"),
        themeName,
      }),
      { cacheable: true },
    );
  } catch {
    return sendSvgResponse(
      res,
      500,
      createSvg({
        username,
        languages: [],
        langsCount,
        cardWidth,
        disableAnimations,
        state: buildState("error"),
        themeName,
      }),
    );
  }
}
