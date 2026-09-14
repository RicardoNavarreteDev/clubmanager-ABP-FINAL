// Este archivo recibe las requests HTTP del modulo de usuarios y responde en formato JSON.
import {
  createUser as createUserRecord,
  deleteUser as deleteUserRecord,
  getUserByEmail,
  getUserById as getUserByIdRecord,
  getUsers,
  updateUser as updateUserRecord,
} from "./users.service.js";
import {
  validateCreateUserPayload,
  validateUpdateUserPayload,
  validateUserFilters,
  validateUserId,
} from "./users.validation.js";
import { sendSuccess, sendError } from "../../shared/responses/api-response.js";

const sanitizeUser = ({ passwordHash, ...user }) => user;

const resolveErrorStatus = (message) => {
  if (message.includes("no encontrado")) {
    return 404;
  }

  if (message.includes("obligatorio") || message.includes("debe") || message.includes("Debes")) {
    return 400;
  }

  if (message.includes("ya existe") || message.includes("desactivada")) {
    return 409;
  }

  return 500;
};

export const listUsers = async (req, res, next) => {
  try {
    const filters = validateUserFilters(req.query);
    const users = await getUsers(filters, { clubId: req.user?.clubId ?? null });

    // Antes de responder limpiamos el hash para no exponer datos sensibles del usuario.
    const safeUsers = users.map((user) => sanitizeUser(user));

    return sendSuccess(res, "Usuarios obtenidos correctamente", safeUsers);
  } catch (error) {
    return sendError(res, error.message || "No se pudieron obtener los usuarios", resolveErrorStatus(error.message || ""));
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const userId = validateUserId(req.params.id);
    const user = await getUserByIdRecord(userId, { clubId: req.user?.clubId ?? null });

    if (!user) {
      return sendError(res, "Usuario no encontrado", 404);
    }

    return sendSuccess(res, "Usuario obtenido correctamente", sanitizeUser(user));
  } catch (error) {
    return sendError(res, error.message || "No se pudo obtener el usuario", resolveErrorStatus(error.message || ""));
  }
};

export const createUser = async (req, res, next) => {
  try {
    const payload = validateCreateUserPayload(req.body);
    const existingUser = await getUserByEmail(payload.email);

    if (existingUser) {
      return sendError(res, "Ya existe un usuario con ese email", 409);
    }

    const createdUser = await createUserRecord(payload, { clubId: req.user?.clubId ?? null });
    return sendSuccess(res, "Usuario creado correctamente", sanitizeUser(createdUser), 201);
  } catch (error) {
    return sendError(res, error.message || "No se pudo crear el usuario", resolveErrorStatus(error.message || ""));
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const userId = validateUserId(req.params.id);
    const payload = validateUpdateUserPayload(req.body);
    const updatedUser = await updateUserRecord(userId, payload, { clubId: req.user?.clubId ?? null });

    if (!updatedUser) {
      return sendError(res, "Usuario no encontrado", 404);
    }

    return sendSuccess(res, "Usuario actualizado correctamente", sanitizeUser(updatedUser));
  } catch (error) {
    return sendError(res, error.message || "No se pudo actualizar el usuario", resolveErrorStatus(error.message || ""));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = validateUserId(req.params.id);
    const wasDeleted = await deleteUserRecord(userId, { clubId: req.user?.clubId ?? null });

    if (!wasDeleted) {
      return sendError(res, "Usuario no encontrado", 404);
    }

    return sendSuccess(res, "Usuario eliminado correctamente", null);
  } catch (error) {
    return sendError(res, error.message || "No se pudo eliminar el usuario", resolveErrorStatus(error.message || ""));
  }
};
