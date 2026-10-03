export function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    error: "Not Found",
  });
}

export function errorHandler(error, req, res, _next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, error.message || error);

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `An account with that ${field} already exists.`,
      error: "Conflict",
    });
  }

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors || {}).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", ") || "Validation failed.",
      error: "Validation Error",
    });
  }

  // Mongoose invalid ObjectId error
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format for ${error.path}.`,
      error: "Bad Request",
    });
  }

  // Invalid JSON payload in request body
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload provided.",
      error: "Bad Request",
    });
  }

  const statusCode = error.status || error.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: error.message || "An unexpected error occurred on the server.",
    error: statusCode === 500 ? "Internal Server Error" : error.message,
  });
}
