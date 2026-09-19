const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("flavor-fusion-token");
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem("flavor-fusion-token");
    localStorage.removeItem("flavor-fusion-user");
    window.dispatchEvent(new Event("auth-logout"));
  }
  if (!response.ok)
    throw new Error(
      data.message || data.error || "Unable to complete your request.",
    );
  return data;
}
