const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getAuthToken() {
  return localStorage.getItem("flavor-fusion-token");
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("flavor-fusion-user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token, user) {
  if (token) {
    localStorage.setItem("flavor-fusion-token", token);
  }
  if (user) {
    localStorage.setItem("flavor-fusion-user", JSON.stringify(user));
  }
  window.dispatchEvent(new Event("auth-change"));
}

export function clearAuthSession() {
  localStorage.removeItem("flavor-fusion-token");
  localStorage.removeItem("flavor-fusion-user");
  window.dispatchEvent(new Event("auth-logout"));
  window.dispatchEvent(new Event("auth-change"));
}

export async function api(path, options = {}) {
  const token = getAuthToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const defaultHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && !path.startsWith("/auth/login") && !path.startsWith("/auth/register")) {
    clearAuthSession();
  }

  if (!response.ok) {
    throw new Error(
      data.error || data.message || "Unable to complete your request."
    );
  }

  return data;
}

export default api;
