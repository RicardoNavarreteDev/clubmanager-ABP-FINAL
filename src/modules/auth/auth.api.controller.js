// Este archivo recibe las requests HTTP del modulo de autenticacion y responde en formato JSON.
import { loginWithCredentials, registerWithInvitation } from "./auth.service.js";
import { validateLoginPayload, validateRegisterPayload } from "./auth.validation.js";
import { sendError, sendSuccess } from "../../shared/responses/api-response.js";

const resolveErrorStatus = (message) => {
  if (message.includes("no existe") || message.includes("no disponible")) {
    return 404;
  }

  if (message.includes("Credenciales invalidas")) {
    return 401;
  }

  if (message.includes("obligatoria") || message.includes("obligatorio") || message.includes("debe") || message.includes("Debes") || message.includes("expiro")) {
    return 400;
  }

  if (message.includes("inactiva") || message.includes("ya existe")) {
    return 409;
  }

  return 500;
};

export const register = async (req, res) => {
  try {
    const payload = validateRegisterPayload(req.body);
    const session = await registerWithInvitation(payload);
    return sendSuccess(res, "Registro completado correctamente", session, 201);
  } catch (error) {
    return sendError(res, error.message || "No se pudo completar el registro", resolveErrorStatus(error.message || ""));
  }
};

export const login = async (req, res) => {
  try {
    const payload = validateLoginPayload(req.body);
    const session = await loginWithCredentials(payload);
    return sendSuccess(res, "Sesion iniciada correctamente", session);
  } catch (error) {
    return sendError(res, error.message || "No se pudo iniciar sesion", resolveErrorStatus(error.message || ""));
  }
};
