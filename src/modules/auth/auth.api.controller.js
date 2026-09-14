// Este archivo recibe las requests HTTP del modulo de autenticacion y responde en formato JSON.
import { unlink } from "node:fs/promises";
import {
  getAuthenticatedSession,
  loginWithCredentials,
  registerWithInvitation,
  updateAuthenticatedUserAvatar,
  updateAuthenticatedUserEmail,
  updateAuthenticatedUserPassword,
  updateAuthenticatedUserProfile,
} from "./auth.service.js";
import {
  validateChangeEmailPayload,
  validateChangePasswordPayload,
  validateLoginPayload,
  validateRegisterPayload,
  validateUpdateProfilePayload,
} from "./auth.validation.js";
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

  if (message.includes("Solo se permiten imagenes") || message.includes("archivo") || message.includes("avatar")) {
    return 400;
  }

  if (message.includes("no coincide")) {
    return 400;
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

export const me = async (req, res) => {
  try {
    const session = await getAuthenticatedSession(req.user.userId, req.user.clubId);
    return sendSuccess(res, "Usuario autenticado obtenido correctamente", session);
  } catch (error) {
    return sendError(res, error.message || "No se pudo obtener la sesion autenticada", resolveErrorStatus(error.message || ""));
  }
};

export const uploadMyAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, "Debes enviar un archivo en el campo avatar.", 400);
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const session = await updateAuthenticatedUserAvatar(req.user.userId, avatarPath);
    return sendSuccess(res, "Avatar actualizado correctamente", session);
  } catch (error) {
    if (req.file?.path) {
      await unlink(req.file.path).catch(() => null);
    }

    return sendError(res, error.message || "No se pudo actualizar el avatar", error.statusCode || resolveErrorStatus(error.message || ""));
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const payload = validateUpdateProfilePayload(req.body);
    const session = await updateAuthenticatedUserProfile(req.user.userId, payload);
    return sendSuccess(res, "Perfil actualizado correctamente", session);
  } catch (error) {
    return sendError(res, error.message || "No se pudo actualizar el perfil", resolveErrorStatus(error.message || ""));
  }
};

export const updateMyEmail = async (req, res) => {
  try {
    const payload = validateChangeEmailPayload(req.body);
    const session = await updateAuthenticatedUserEmail(req.user.userId, payload);
    return sendSuccess(res, "Correo actualizado correctamente", session);
  } catch (error) {
    return sendError(res, error.message || "No se pudo actualizar el correo", resolveErrorStatus(error.message || ""));
  }
};

export const updateMyPassword = async (req, res) => {
  try {
    const payload = validateChangePasswordPayload(req.body);
    await updateAuthenticatedUserPassword(req.user.userId, payload);
    return sendSuccess(res, "Password actualizada correctamente", null);
  } catch (error) {
    return sendError(res, error.message || "No se pudo actualizar la password", resolveErrorStatus(error.message || ""));
  }
};
