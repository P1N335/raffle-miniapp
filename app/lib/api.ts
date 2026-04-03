const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

function normalizeBaseUrl(baseUrl?: string) {
  return baseUrl?.replace(/\/+$/, "") ?? "";
}

function resolveApiBaseUrl() {
  const normalizedBaseUrl = normalizeBaseUrl(rawApiBaseUrl);

  if (typeof window === "undefined") {
    return normalizedBaseUrl || "/api";
  }

  if (!normalizedBaseUrl) {
    return "/api";
  }

  if (window.location.protocol === "https:" && normalizedBaseUrl.startsWith("http://")) {
    console.warn(
      "NEXT_PUBLIC_API_BASE_URL uses http inside an https context. Falling back to same-origin /api."
    );
    return "/api";
  }

  return normalizedBaseUrl;
}

export function buildApiUrl(path: string) {
  const apiBaseUrl = resolveApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${apiBaseUrl}${normalizedPath}`;
}
