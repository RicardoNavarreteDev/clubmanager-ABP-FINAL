// Este archivo recibe las requests HTTP del modulo de invitaciones y responde en formato JSON.
import {
  createInvitation as createInvitationRecord,
  getInvitationById as getInvitationByIdRecord,
  getInvitationByToken as getInvitationByTokenRecord,
  getInvitations,
  updateInvitationStatus,
} from "./invitations.service.js";
import {
  validateCreateInvitationPayload,
  validateInvitationFilters,
  validateInvitationId,
  validateInvitationStatusPayload,
  validateInvitationToken,
} from "./invitations.validation.js";
import { sendError, sendSuccess } from "../../shared/responses/api-response.js";

const resolveErrorStatus = (message) => {
  if (message.includes("no encontrado")) {
    return 404;
  }

  if (message.includes("obligatorio") || message.includes("debe") || message.includes("Debes")) {
    return 400;
  }

  if (message.includes("desactivada")) {
    return 409;
  }

  if (message.includes("Ya existe") || message.includes("ya tiene una invitacion aceptada")) {
    return 409;
  }

  return 500;
};

export const listInvitations = async (req, res) => {
  try {
    const filters = validateInvitationFilters(req.query);
    const invitations = await getInvitations(filters);
    return sendSuccess(res, "Invitaciones obtenidas correctamente", invitations);
  } catch (error) {
    return sendError(res, error.message || "No se pudieron obtener las invitaciones", resolveErrorStatus(error.message || ""));
  }
};

export const getInvitationById = async (req, res) => {
  try {
    const invitationId = validateInvitationId(req.params.id);
    const invitation = await getInvitationByIdRecord(invitationId);

    if (!invitation) {
      return sendError(res, "Invitacion no encontrada", 404);
    }

    return sendSuccess(res, "Invitacion obtenida correctamente", invitation);
  } catch (error) {
    return sendError(res, error.message || "No se pudo obtener la invitacion", resolveErrorStatus(error.message || ""));
  }
};

export const getInvitationByToken = async (req, res) => {
  try {
    const token = validateInvitationToken(req.params.token);
    const invitation = await getInvitationByTokenRecord(token);

    if (!invitation) {
      return sendError(res, "Invitacion no encontrada", 404);
    }

    return sendSuccess(res, "Invitacion obtenida correctamente", invitation);
  } catch (error) {
    return sendError(res, error.message || "No se pudo obtener la invitacion", resolveErrorStatus(error.message || ""));
  }
};

export const createInvitation = async (req, res) => {
  try {
    const payload = validateCreateInvitationPayload(req.body);
    const invitation = await createInvitationRecord(payload);
    return sendSuccess(res, "Invitacion creada correctamente", invitation, 201);
  } catch (error) {
    return sendError(res, error.message || "No se pudo crear la invitacion", resolveErrorStatus(error.message || ""));
  }
};

export const patchInvitationStatus = async (req, res) => {
  try {
    const invitationId = validateInvitationId(req.params.id);
    const payload = validateInvitationStatusPayload(req.body);
    const invitation = await updateInvitationStatus(invitationId, payload.status);

    if (!invitation) {
      return sendError(res, "Invitacion no encontrada", 404);
    }

    return sendSuccess(res, "Estado de la invitacion actualizado correctamente", invitation);
  } catch (error) {
    return sendError(res, error.message || "No se pudo actualizar el estado de la invitacion", resolveErrorStatus(error.message || ""));
  }
};
