// Este archivo concentra el acceso a datos del modulo de usuarios sobre Sequelize.
import { createHash } from "node:crypto";
import { Op } from "sequelize";
import User from "../../models/user.model.js";
import { initModelAssociations } from "../../models/associations.js";

const shouldUseDatabase = () => process.env.DB_READ_USERS === "true";

const ensureDatabaseEnabled = () => {
  if (!shouldUseDatabase()) {
    throw new Error("La lectura y escritura de usuarios en base de datos esta desactivada.");
  }
};

// Por ahora usamos un hash simple con crypto nativo para no agregar dependencias antes del modulo de auth.
const hashPassword = (password) => createHash("sha256").update(password).digest("hex");

// Este mapeo expone nombres de campos consistentes con el resto de la app y oculta detalles del modelo.
const mapUser = (user) => ({
  id: user.id,
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

export const getUsers = async (filters = {}) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const where = {};

  if (filters.email) {
    where.email = {
      [Op.iLike]: `%${filters.email}%`,
    };
  }

  if (filters.displayName) {
    where.displayName = {
      [Op.iLike]: `%${filters.displayName}%`,
    };
  }

  if (typeof filters.isActive === "boolean") {
    where.isActive = filters.isActive;
  }

  const users = await User.findAll({
    where,
    order: [["id", "ASC"]],
  });

  return users.map((user) => mapUser(user));
};

export const getUserById = async (id) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const user = await User.findByPk(id);
  return user ? mapUser(user) : null;
};

export const getUserByEmail = async (email) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const user = await User.findOne({
    where: { email },
  });

  return user ? mapUser(user) : null;
};

export const createUser = async (payload) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const user = await User.create({
    email: payload.email,
    displayName: payload.displayName,
    passwordHash: hashPassword(payload.password),
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

export const updateUser = async (id, payload) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const user = await User.findByPk(id);

  if (!user) {
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
    nextValues.passwordHash = hashPassword(payload.password);
  }

  await user.update(nextValues);

  return mapUser(user);
};

export const deleteUser = async (id) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const user = await User.findByPk(id);

  if (!user) {
    return false;
  }

  await user.destroy();
  return true;
};
