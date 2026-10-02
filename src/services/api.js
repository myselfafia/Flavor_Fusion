const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let inMemoryAccessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token || null;
};

export const getAccessToken = () => {
  return inMemoryAccessToken;
};

/**
 * Attempts to obtain a new access token using the httpOnly refreshToken cookie.
 * Ensures single-flight execution if multiple requests trigger refresh concurrently.
 */
export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setAccessToken(null);
        window.dispatchEvent(new Event("auth-logout"));
        return null;
      }

      const data = await response.json().catch(() => ({}));
      if (data && data.accessToken) {
        setAccessToken(data.accessToken);
        window.dispatchEvent(
          new CustomEvent("auth-refreshed", { detail: data }),
        );
        return data.accessToken;
      }

      setAccessToken(null);
      window.dispatchEvent(new Event("auth-logout"));
      return null;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Main API request wrapper.
 * Sends in-memory Bearer token, includes credentials, and handles 401 retry with refresh.
 */
export async function api(path, options = {}, isRetry = false) {
  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  // Attempt automatic refresh on 401 (only once, excluding auth endpoints)
  if (
    response.status === 401 &&
    !isRetry &&
    !path.includes("/auth/refresh") &&
    !path.includes("/auth/login") &&
    !path.includes("/auth/register")
  ) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return api(path, options, true);
    }
    window.dispatchEvent(new Event("auth-logout"));
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Unable to complete your request.",
    );
  }

  return data;
}
