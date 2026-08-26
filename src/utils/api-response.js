// Este archivo concentra helpers para responder JSON con un formato consistente.
export const sendSuccess = (res, message, data, statusCode = 200) => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

export const sendError = (res, message, statusCode = 400, data = null) => {
  res.status(statusCode).json({
    status: "error",
    message,
    data,
  });
};
