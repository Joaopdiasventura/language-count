export function buildState(stateKey, statusCode) {
  if (stateKey === "missing-username") {
    return {
      badge: "INPUT REQUIRED",
      title: "No username provided",
      message: "Add ?username=your-github-handle to generate this card.",
    };
  }

  if (stateKey === "empty-languages") {
    return {
      badge: "NO VISIBLE DATA",
      title: "No visible languages",
      message:
        "All detected languages were filtered out or no public code was found.",
    };
  }

  if (stateKey === "error") {
    return {
      badge: "GENERATION ERROR",
      title: "Unable to build card",
      message: "The generator failed before the SVG could be completed.",
    };
  }

  return {
    badge: statusCode === 404 ? "PROFILE NOT FOUND" : "GITHUB UNAVAILABLE",
    title: statusCode === 404 ? "Profile unavailable" : "GitHub request failed",
    message:
      statusCode === 404
        ? "No public GitHub profile matched this username."
        : `GitHub returned status ${statusCode} while loading repositories.`,
  };
}
