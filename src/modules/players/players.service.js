// Este archivo concentra el acceso a datos del modulo de jugadores.
import { Op } from "sequelize";
import Player from "../../models/player.model.js";
import { initModelAssociations } from "../../models/associations.js";
import { getPlayers as getPlayersFromJson } from "../../shared/data/json.service.js";

const shouldUseDatabase = () => process.env.DB_READ_PLAYERS === "true";

const ensureDatabaseEnabled = () => {
  if (!shouldUseDatabase()) {
    throw new Error("La lectura y escritura de jugadores en base de datos esta desactivada.");
  }
};

// Este mapeo deja el mismo shape tanto si el jugador vino de Sequelize como si vino desde JSON.
const mapPlayer = (player) => ({
  id: player.id,
  clubId: player.clubId ?? null,
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

const mapPlayerListItem = (player) => ({
  id: player.id,
  clubId: player.clubId ?? null,
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
  categoryName: player.primaryCategory?.name ?? null,
});

const mapPlayerDetail = (player) => ({
  ...mapPlayer(player),
  primaryCategory: player.primaryCategory
    ? {
        id: player.primaryCategory.id,
        name: player.primaryCategory.name,
        genderScope: player.primaryCategory.genderScope,
        minAge: player.primaryCategory.minAge,
        maxAge: player.primaryCategory.maxAge,
      }
    : null,
  user: player.user
    ? {
        id: player.user.id,
        email: player.user.email,
        displayName: player.user.displayName,
        isActive: player.user.isActive,
      }
    : null,
});

export const getPlayers = async (filters = {}) => {
  if (!shouldUseDatabase()) {
    return getPlayersFromJson();
  }

  initModelAssociations();

  const where = {};

  if (filters.name) {
    where.name = {
      [Op.iLike]: `%${filters.name}%`,
    };
  }

  if (filters.primaryCategoryId) {
    where.primaryCategoryId = filters.primaryCategoryId;
  }

  if (filters.rosterStatus) {
    where.rosterStatus = filters.rosterStatus;
  }

  if (filters.clubId) {
    where.clubId = filters.clubId;
  }

  const escapeLikeWildcards = (value) => String(value).replace(/[%_\\]/g, (match) => `\\${match}`);
  if (where.name?.[Op.iLike]) {
    where.name[Op.iLike] = `%${escapeLikeWildcards(filters.name)}%`;
  }

  const page = Number.isInteger(filters.page) && filters.page > 0 ? filters.page : 1;
  const limit = Number.isInteger(filters.limit) && filters.limit > 0 ? Math.min(filters.limit, 50) : 50;
  const offset = (page - 1) * limit;

  // Ordenamos por id para mantener una salida estable y consistente con los JSON semilla.
  const players = await Player.findAll({
    where,
    include: [{ association: "primaryCategory" }],
    order: [["id", "ASC"]],
    limit,
    offset,
  });

  return players.map((player) => mapPlayerListItem(player));
};

export const getPlayerById = async (id, clubId = null) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const player = await Player.findOne({
    where: { id, ...(clubId ? { clubId } : {}) },
    include: [
      { association: "primaryCategory" },
      { association: "user" },
    ],
  });

  return player ? mapPlayerDetail(player) : null;
};

export const updatePlayer = async (id, payload, clubId = null) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const player = await Player.findOne({
    where: { id, ...(clubId ? { clubId } : {}) },
    include: [
      { association: "primaryCategory" },
      { association: "user" },
    ],
  });

  if (!player) {
    return null;
  }

  await player.update({
    ...payload,
    updatedAt: new Date(),
  });

  await player.reload({
    include: [
      { association: "primaryCategory" },
      { association: "user" },
    ],
  });

  return mapPlayerDetail(player);
};

export const updatePlayerStatus = async (id, rosterStatus, clubId = null) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const player = await Player.findOne({
    where: { id, ...(clubId ? { clubId } : {}) },
    include: [
      { association: "primaryCategory" },
      { association: "user" },
    ],
  });

  if (!player) {
    return null;
  }

  // El estado del plantel se cambia en un flujo aparte para no mezclar decisiones deportivas con la edicion de la ficha.
  await player.update({
    rosterStatus,
    updatedAt: new Date(),
  });

  await player.reload({
    include: [
      { association: "primaryCategory" },
      { association: "user" },
    ],
  });

  return mapPlayerDetail(player);
};
