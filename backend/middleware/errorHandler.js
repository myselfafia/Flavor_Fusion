export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(error);
  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: "An account with that email already exists." });
  }
  return res.status(error.status || 500).json({ success: false, message: error.message || "Something went wrong." });
}
