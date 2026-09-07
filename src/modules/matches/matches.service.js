// Este archivo obtiene partidos desde JSON o desde la base de datos segun el flag activo.
import { Op } from "sequelize";
import Match from "../../models/match.model.js";
import { getMatches as getMatchesFromJson } from "../../shared/data/json.service.js";

const shouldUseDatabase = () => process.env.DB_READ_MATCHES === "true";

const ensureDatabaseEnabled = () => {
  if (!shouldUseDatabase()) {
    throw new Error("La creacion de partidos requiere DB_READ_MATCHES=true.");
  }
};

const getClubWhere = ({ clubId, includeLegacy = false } = {}) => {
  if (clubId === undefined || clubId === null) {
    return {};
  }

  return includeLegacy
    ? { [Op.or]: [{ clubId }, { clubId: null }] }
    : { clubId };
};

// Este mapeo deja el mismo shape tanto si el partido vino de Sequelize como si vino desde JSON.
const mapMatch = (match) => ({
  id: match.id,
  clubId: match.clubId ?? null,
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

export const getMatches = async (options = {}) => {
  if (!shouldUseDatabase()) {
    const matches = await getMatchesFromJson();
    return options.clubId === undefined || options.clubId === null || options.includeLegacy
      ? matches.map((match) => mapMatch(match))
      : [];
  }

  // Ordenamos por id para no cambiar el orden visual de los partidos al pasar de JSON a DB.
  const matches = await Match.findAll({
    where: getClubWhere(options),
    order: [["id", "ASC"]],
  });

  return matches.map((match) => mapMatch(match));
};

export const createMatch = async (payload) => {
  ensureDatabaseEnabled();
  const now = new Date();
  const match = await Match.create({
    ...payload,
    status: "upcoming",
    result: "Pendiente",
    createdAt: now,
    updatedAt: now,
  });
  return mapMatch(match);
};
