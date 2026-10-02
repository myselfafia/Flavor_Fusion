export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

<<<<<<< HEAD
export function errorHandler(error, req, res, _next) {
  console.error("Internal Error:", error.message || error);
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "An account with that email or identifier already exists.",
=======
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, _next) {
  console.error(error);
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "An account with that email already exists.",
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
    });
  }
  return res.status(error.status || 500).json({
    success: false,
<<<<<<< HEAD
    message: error.message || "An unexpected error occurred on the server.",
=======
    message: error.message || "Something went wrong.",
>>>>>>> ed4a2f0b729c2bcee7194781e48511565664ca6f
  });
}
