// Este archivo obtiene jugadores desde JSON o desde la base de datos segun el flag activo.
import Player from "../models/player.model.js";
import { getPlayers as getPlayersFromJson } from "./json.service.js";

const shouldUseDatabase = () => process.env.DB_READ_PLAYERS === "true";

// Este mapeo deja el mismo shape tanto si el jugador vino de Sequelize como si vino desde JSON.
const mapPlayer = (player) => ({
  id: player.id,
  userId: player.userId,
  name: player.name,
  position: player.position,
  number: player.number,
  avatar: player.avatar,
  bio: player.bio,
  location: player.location,
  birthDate: player.birthDate,
  team: player.team,
  rosterStatus: player.rosterStatus,
  primaryCategoryId: player.primaryCategoryId,
  createdAt: player.createdAt,
  updatedAt: player.updatedAt,
});

export const getPlayers = async () => {
  if (!shouldUseDatabase()) {
    return getPlayersFromJson();
  }

  // Ordenamos por id para mantener una salida estable y consistente con los JSON semilla.
  const players = await Player.findAll({
    order: [["id", "ASC"]],
  });

  return players.map((player) => mapPlayer(player));
};
