// Este archivo obtiene campeonatos desde JSON o desde la base de datos segun el flag activo.
import { Op } from "sequelize";
import Championship from "../../models/championship.model.js";
import { getChampionships as getChampionshipsFromJson } from "../../shared/data/json.service.js";

const shouldUseDatabase = () => process.env.DB_READ_CHAMPIONSHIPS === "true";

const ensureDatabaseEnabled = () => {
  if (!shouldUseDatabase()) {
    throw new Error("La creacion de campeonatos requiere DB_READ_CHAMPIONSHIPS=true.");
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

// Este mapeo deja el mismo shape tanto si el campeonato vino de Sequelize como si vino desde JSON.
const mapChampionship = (championship) => ({
  id: championship.id,
  clubId: championship.clubId ?? null,
  name: championship.name,
  season: championship.season,
  categoryId: championship.categoryId,
  description: championship.description,
  primaryVenue: championship.primaryVenue,
  isVariableVenue: championship.isVariableVenue,
  status: championship.status,
  startDate: championship.startDate,
  endDate: championship.endDate,
  createdAt: championship.createdAt,
  updatedAt: championship.updatedAt,
});

export const getChampionships = async (options = {}) => {
  if (!shouldUseDatabase()) {
    const championships = await getChampionshipsFromJson();
    return options.clubId === undefined || options.clubId === null || options.includeLegacy
      ? championships.map((championship) => mapChampionship(championship))
      : [];
  }

  // Ordenamos por id para mantener estable el listado de campeonatos en la interfaz.
  const championships = await Championship.findAll({
    where: getClubWhere(options),
    order: [["id", "ASC"]],
  });

  return championships.map((championship) => mapChampionship(championship));
};

export const getChampionshipById = async (id, options = {}) => {
  if (!shouldUseDatabase()) {
    const championships = await getChampionships(options);
    return championships.find((championship) => championship.id === id) ?? null;
  }

  const championship = await Championship.findOne({
    where: { id, ...getClubWhere(options) },
  });

  return championship ? mapChampionship(championship) : null;
};

export const createChampionship = async (payload) => {
  ensureDatabaseEnabled();
  const now = new Date();
  const championship = await Championship.create({
    ...payload,
    status: "upcoming",
    createdAt: now,
    updatedAt: now,
  });
  return mapChampionship(championship);
};
