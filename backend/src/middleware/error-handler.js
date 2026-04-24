/**
 * Error Handler Middleware
 *
 * Menangkap semua error yang tidak tertangani di controller/route.
 * Menampilkan response JSON yang konsisten.
 */

function errorHandler(err, req, res, _next) {
  console.error("[Error]", err.message);

  // Joi/validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  // Default: internal server error
  const status = err.status || 500;
  res.status(status).json({
    error: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

/**
 * Async handler wrapper
 *
 * Wraps async route handlers agar error otomatis ditangkap
 * dan diteruskan ke error handler middleware.
 *
 * @param {Function} fn - Async route handler
 * @returns {Function} - Express middleware
 *
 * @example
 *   router.get("/papers", asyncHandler(async (req, res) => {
 *     const papers = await getPapers();
 *     res.json(papers);
 *   }));
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, asyncHandler };
