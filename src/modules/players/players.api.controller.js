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
    const players = await getPlayers(filters);
    return sendSuccess(res, "Jugadores obtenidos correctamente", players);
  } catch (error) {
    return sendError(res, error.message || "No se pudieron obtener los jugadores", resolveErrorStatus(error.message || ""));
  }
};

export const getPlayerById = async (req, res) => {
  try {
    const playerId = validatePlayerId(req.params.id);
    const player = await getPlayerByIdRecord(playerId);

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
    const updatedPlayer = await updatePlayerRecord(playerId, payload);

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
    const updatedPlayer = await updatePlayerStatus(playerId, payload.rosterStatus);

    if (!updatedPlayer) {
      return sendError(res, "Jugador no encontrado", 404);
    }

    return sendSuccess(res, "Estado del jugador actualizado correctamente", updatedPlayer);
  } catch (error) {
    return sendError(res, error.message || "No se pudo actualizar el estado del jugador", resolveErrorStatus(error.message || ""));
  }
};
