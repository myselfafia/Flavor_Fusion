export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(error, req, res, _next) {
  console.error("Internal Error:", error.message || error);
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "An account with that email or identifier already exists.",
    });
  }
  return res.status(error.status || 500).json({
    success: false,
    message: error.message || "An unexpected error occurred on the server.",
  });
}
