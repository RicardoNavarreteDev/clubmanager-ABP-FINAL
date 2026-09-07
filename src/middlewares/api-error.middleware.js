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

  res.status(error.statusCode || 500).json({
    status: "error",
    message: error.message || "Error interno del servidor",
    data: null,
  });
};
