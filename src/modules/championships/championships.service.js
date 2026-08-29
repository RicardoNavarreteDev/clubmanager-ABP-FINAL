// Este archivo obtiene campeonatos desde JSON o desde la base de datos segun el flag activo.
import Championship from "../../models/championship.model.js";
import { getChampionships as getChampionshipsFromJson } from "../../shared/data/json.service.js";

const shouldUseDatabase = () => process.env.DB_READ_CHAMPIONSHIPS === "true";

// Este mapeo deja el mismo shape tanto si el campeonato vino de Sequelize como si vino desde JSON.
const mapChampionship = (championship) => ({
  id: championship.id,
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

export const getChampionships = async () => {
  if (!shouldUseDatabase()) {
    return getChampionshipsFromJson();
  }

  // Ordenamos por id para mantener estable el listado de campeonatos en la interfaz.
  const championships = await Championship.findAll({
    order: [["id", "ASC"]],
  });

  return championships.map((championship) => mapChampionship(championship));
};
