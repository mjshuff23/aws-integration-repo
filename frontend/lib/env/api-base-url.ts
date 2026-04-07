function resolveApiBaseUrl() {
  const envValue = process.env.NEXT_PUBLIC_API_URL?.trim();
  const fallback =
    process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:4000/api";
  const normalizedBaseUrl = (envValue || fallback).replace(/\/$/, "");

  return normalizedBaseUrl.endsWith("/api")
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();
