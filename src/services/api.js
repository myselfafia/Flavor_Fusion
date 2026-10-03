const API_URL = import.meta.env.VITE_API_URL || "/api";

let inMemoryAccessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token || null;
};

export const getAccessToken = () => {
  return inMemoryAccessToken;
};

export const clearAccessToken = () => {
  inMemoryAccessToken = null;
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
      const token = data.accessToken || data.token;
      if (token) {
        setAccessToken(token);
        window.dispatchEvent(
          new CustomEvent("auth-refreshed", { detail: data }),
        );
        return token;
      }

      setAccessToken(null);
      window.dispatchEvent(new Event("auth-logout"));
      return null;
    } catch (err) {
      console.warn("Silent token refresh failed:", err.message);
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
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...options,
      headers,
    });
  } catch (networkError) {
    console.error(`Network error requesting ${path}:`, networkError.message);
    const err = new Error(
      "Unable to connect to the backend server. Please make sure the backend server is running.",
    );
    err.isNetworkError = true;
    throw err;
  }

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

  let data = {};
  try {
    const text = await response.text();
    if (text) {
      data = JSON.parse(text);
    }
  } catch (parseError) {
    console.warn(
      `Failed to parse response JSON from ${path}:`,
      parseError.message,
    );
    data = {};
  }

  if (!response.ok) {
    const message =
      data.error ||
      data.message ||
      `Request failed with status ${response.status} (${response.statusText || "Error"})`;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export default api;
