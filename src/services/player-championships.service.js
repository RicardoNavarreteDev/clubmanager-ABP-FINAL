// Este archivo obtiene la relacion entre jugadores y campeonatos segun la fuente activa.
import PlayerChampionship from "../models/player-championship.model.js";
import { getPlayerChampionships as getPlayerChampionshipsFromJson } from "./json.service.js";

const shouldUseDatabase = () => process.env.DB_READ_PLAYER_CHAMPIONSHIPS === "true";

// Este mapeo deja la tabla intermedia en formato simple para los cruces que hacen los controllers.
const mapPlayerChampionship = (playerChampionship) => ({
  playerId: playerChampionship.playerId,
  championshipId: playerChampionship.championshipId,
});

export const getPlayerChampionships = async () => {
  if (!shouldUseDatabase()) {
    return getPlayerChampionshipsFromJson();
  }

  // Ordenamos por ambas claves para que los recorridos y comparaciones sean deterministas.
  const playerChampionships = await PlayerChampionship.findAll({
    order: [
      ["playerId", "ASC"],
      ["championshipId", "ASC"],
    ],
  });

  return playerChampionships.map((playerChampionship) => mapPlayerChampionship(playerChampionship));
};
