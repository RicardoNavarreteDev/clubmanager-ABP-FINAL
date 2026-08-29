// Este archivo obtiene partidos desde JSON o desde la base de datos segun el flag activo.
import Match from "../../models/match.model.js";
import { getMatches as getMatchesFromJson } from "../../shared/data/json.service.js";

const shouldUseDatabase = () => process.env.DB_READ_MATCHES === "true";

// Este mapeo deja el mismo shape tanto si el partido vino de Sequelize como si vino desde JSON.
const mapMatch = (match) => ({
  id: match.id,
  championshipId: match.championshipId,
  opponent: match.opponent,
  date: match.date,
  time: match.time,
  location: match.location,
  condition: match.condition,
  status: match.status,
  result: match.result,
  createdAt: match.createdAt,
  updatedAt: match.updatedAt,
});

export const getMatches = async () => {
  if (!shouldUseDatabase()) {
    return getMatchesFromJson();
  }

  // Ordenamos por id para no cambiar el orden visual de los partidos al pasar de JSON a DB.
  const matches = await Match.findAll({
    order: [["id", "ASC"]],
  });

  return matches.map((match) => mapMatch(match));
};
