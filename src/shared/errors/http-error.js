// Helper central para errores HTTP con statusCode explícito.
export const httpError = (message, statusCode = 500) => Object.assign(new Error(message), { statusCode });

export const resolveHttpStatus = (error, fallback = 500) => {
  if (Number.isInteger(error?.statusCode)) {
    return error.statusCode;
  }

  const message = error?.message ?? "";

  if (message.includes("no encontrado") || message.includes("no encontrada")) {
    return 404;
  }

  if (message.includes("obligatorio") || message.includes("debe") || message.includes("Debes")) {
    return 400;
  }

  if (message.includes("ya existe") || message.includes("desactivada")) {
    return 409;
  }

  return fallback;
};
