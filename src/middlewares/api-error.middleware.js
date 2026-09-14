// Este archivo centraliza el manejo de errores de la API.
export const apiErrorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (!req.originalUrl.startsWith("/api")) {
    next(error);
    return;
  }

  const statusCode = error.statusCode || 500;
  const isServerError = statusCode >= 500;
  const message = isServerError && process.env.NODE_ENV === "production"
    ? "Error interno del servidor"
    : error.message || "Error interno del servidor";

  res.status(statusCode).json({
    status: "error",
    message,
    data: null,
  });
};
