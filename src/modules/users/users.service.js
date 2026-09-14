// Este archivo concentra el acceso a datos del modulo de usuarios sobre Sequelize.
import { Op } from "sequelize";
import User from "../../models/user.model.js";
import { initModelAssociations } from "../../models/associations.js";
import { hashPassword } from "../../shared/security/password.js";

const shouldUseDatabase = () => process.env.DB_READ_USERS === "true";

const ensureDatabaseEnabled = () => {
  if (!shouldUseDatabase()) {
    throw new Error("La lectura y escritura de usuarios en base de datos esta desactivada.");
  }
};



// Este mapeo expone nombres de campos consistentes con el resto de la app y oculta detalles del modelo.
const mapUser = (user) => ({
  id: user.id,
  clubId: user.clubId,
  email: user.email,
  displayName: user.displayName,
  avatar: user.avatar,
  bio: user.bio,
  location: user.location,
  birthDate: user.birthDate,
  passwordHash: user.passwordHash,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const escapeLikeWildcards = (value) => String(value).replace(/[%_\\]/g, (match) => `\\${match}`);

export const getUsers = async (filters = {}, scope = {}) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const where = {};

  if (filters.email) {
    where.email = {
      [Op.iLike]: `%${escapeLikeWildcards(filters.email)}%`,
    };
  }

  if (filters.displayName) {
    where.displayName = {
      [Op.iLike]: `%${escapeLikeWildcards(filters.displayName)}%`,
    };
  }

  if (typeof filters.isActive === "boolean") {
    where.isActive = filters.isActive;
  }

  if (scope.clubId !== undefined && scope.clubId !== null) {
    where.clubId = scope.clubId;
  }

  const page = Number.isInteger(scope.page) && scope.page > 0 ? scope.page : 1;
  const limit = Number.isInteger(scope.limit) && scope.limit > 0 ? Math.min(scope.limit, 50) : 20;
  const offset = (page - 1) * limit;

  const users = await User.findAll({
    where,
    order: [["id", "ASC"]],
    limit,
    offset,
  });

  return users.map((user) => mapUser(user));
};

export const getUserById = async (id, scope = {}) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const user = await User.findByPk(id);
  if (!user) {
    return null;
  }

  if (scope.clubId !== undefined && scope.clubId !== null && user.clubId !== scope.clubId) {
    return null;
  }

  return mapUser(user);
};

export const getUserByEmail = async (email) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const user = await User.findOne({
    where: { email },
  });

  return user ? mapUser(user) : null;
};

export const createUser = async (payload, scope = {}) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const user = await User.create({
    clubId: payload.clubId ?? scope.clubId ?? null,
    email: payload.email,
    displayName: payload.displayName,
    passwordHash: await hashPassword(payload.password),
    avatar: payload.avatar ?? null,
    bio: payload.bio ?? null,
    location: payload.location ?? null,
    birthDate: payload.birthDate ?? null,
    isActive: payload.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return mapUser(user);
};

export const updateUser = async (id, payload, scope = {}) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const user = await User.findByPk(id);

  if (!user) {
    return null;
  }

  if (scope.clubId !== undefined && scope.clubId !== null && user.clubId !== scope.clubId) {
    return null;
  }

  const nextValues = {
    displayName: payload.displayName ?? user.displayName,
    avatar: payload.avatar ?? user.avatar,
    bio: payload.bio ?? user.bio,
    location: payload.location ?? user.location,
    birthDate: payload.birthDate ?? user.birthDate,
    isActive: payload.isActive ?? user.isActive,
    updatedAt: new Date(),
  };

  if (payload.password) {
    nextValues.passwordHash = await hashPassword(payload.password);
  }

  await user.update(nextValues);

  return mapUser(user);
};

export const deleteUser = async (id, scope = {}) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const user = await User.findByPk(id);

  if (!user) {
    return false;
  }

  if (scope.clubId !== undefined && scope.clubId !== null && user.clubId !== scope.clubId) {
    return false;
  }

  await user.destroy();
  return true;
};
