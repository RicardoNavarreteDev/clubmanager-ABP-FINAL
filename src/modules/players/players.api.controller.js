// Este archivo recibe las requests HTTP del modulo de jugadores y responde en formato JSON.
import {
  getPlayerById as getPlayerByIdRecord,
  getPlayers,
  updatePlayer as updatePlayerRecord,
  updatePlayerStatus,
} from "./players.service.js";
import {
  validatePlayerFilters,
  validatePlayerId,
  validatePlayerStatusPayload,
  validateUpdatePlayerPayload,
} from "./players.validation.js";
import { sendError, sendSuccess } from "../../shared/responses/api-response.js";
import { getAuthenticatedSession } from "../auth/auth.service.js";

const getCurrentClubId = async (req) => (await getAuthenticatedSession(req.user.userId)).user.clubId;

const resolveErrorStatus = (message) => {
  if (message.includes("no encontrado")) {
    return 404;
  }

  if (message.includes("obligatorio") || message.includes("debe") || message.includes("Debes") || message.includes("no se editan")) {
    return 400;
  }

  if (message.includes("desactivada")) {
    return 409;
  }

  return 500;
};

export const listPlayers = async (req, res) => {
  try {
    const filters = validatePlayerFilters(req.query);
    const clubId = await getCurrentClubId(req);
    const players = await getPlayers({ ...filters, clubId });
    return sendSuccess(res, "Jugadores obtenidos correctamente", players);
  } catch (error) {
    return sendError(res, error.message || "No se pudieron obtener los jugadores", resolveErrorStatus(error.message || ""));
  }
};

export const getPlayerById = async (req, res) => {
  try {
    const playerId = validatePlayerId(req.params.id);
    const clubId = await getCurrentClubId(req);
    const player = await getPlayerByIdRecord(playerId, clubId);

    if (!player) {
      return sendError(res, "Jugador no encontrado", 404);
    }

    return sendSuccess(res, "Jugador obtenido correctamente", player);
  } catch (error) {
    return sendError(res, error.message || "No se pudo obtener el jugador", resolveErrorStatus(error.message || ""));
  }
};

export const updatePlayer = async (req, res) => {
  try {
    const playerId = validatePlayerId(req.params.id);
    const payload = validateUpdatePlayerPayload(req.body);
    const clubId = await getCurrentClubId(req);
    const updatedPlayer = await updatePlayerRecord(playerId, payload, clubId);

    if (!updatedPlayer) {
      return sendError(res, "Jugador no encontrado", 404);
    }

    return sendSuccess(res, "Jugador actualizado correctamente", updatedPlayer);
  } catch (error) {
    return sendError(res, error.message || "No se pudo actualizar el jugador", resolveErrorStatus(error.message || ""));
  }
};

export const patchPlayerStatus = async (req, res) => {
  try {
    const playerId = validatePlayerId(req.params.id);
    const payload = validatePlayerStatusPayload(req.body);

    // Dejar a un jugador inactivo es una decision de administracion mas sensible que hoy reservamos solo a admin.
    if (payload.rosterStatus === "inactive" && !req.user.roles.includes("admin")) {
      return sendError(res, "Solo un admin puede dejar a un jugador en estado inactive.", 403);
    }

    const clubId = await getCurrentClubId(req);
    const updatedPlayer = await updatePlayerStatus(playerId, payload.rosterStatus, clubId);

    if (!updatedPlayer) {
      return sendError(res, "Jugador no encontrado", 404);
    }

    return sendSuccess(res, "Estado del jugador actualizado correctamente", updatedPlayer);
  } catch (error) {
    return sendError(res, error.message || "No se pudo actualizar el estado del jugador", resolveErrorStatus(error.message || ""));
  }
};
