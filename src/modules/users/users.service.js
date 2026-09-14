// Este archivo concentra el acceso a datos del modulo de usuarios sobre Sequelize.
import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import Category from "../../models/category.model.js";
import ClubMembership from "../../models/club-membership.model.js";
import PlayerCategory from "../../models/player-category.model.js";
import Player from "../../models/player.model.js";
import Role from "../../models/role.model.js";
import User from "../../models/user.model.js";
import UserRole from "../../models/user-role.model.js";
import { initModelAssociations } from "../../models/associations.js";
import { hashPassword } from "../../shared/security/password.js";

const shouldUseDatabase = () => process.env.DB_READ_USERS === "true";

const ensureDatabaseEnabled = () => {
  if (!shouldUseDatabase()) {
    throw new Error("La lectura y escritura de usuarios en base de datos esta desactivada.");
  }
};



// Este mapeo expone nombres de campos consistentes con el resto de la app y oculta detalles del modelo.
const mapUser = (user, clubId = user.clubId) => ({
  id: user.id,
  clubId,
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

  const page = Number.isInteger(scope.page) && scope.page > 0 ? scope.page : 1;
  const limit = Number.isInteger(scope.limit) && scope.limit > 0 ? Math.min(scope.limit, 50) : 20;
  const offset = (page - 1) * limit;

  const users = await User.findAll({
    where,
    include: scope.clubId
      ? [{ association: "memberships", where: { clubId: scope.clubId }, required: true, attributes: [] }]
      : [],
    order: [["id", "ASC"]],
    limit,
    offset,
  });

  return users.map((user) => mapUser(user, scope.clubId ?? user.clubId));
};

export const getUserById = async (id, scope = {}) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const user = await User.findOne({
    where: { id },
    include: scope.clubId
      ? [{ association: "memberships", where: { clubId: scope.clubId }, required: true, attributes: ["isOwner"] }]
      : [],
  });
  if (!user) return null;

  return mapUser(user, scope.clubId ?? user.clubId);
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

  const clubId = scope.clubId ?? null;
  if (!clubId) {
    throw new Error("El club es obligatorio para crear un usuario.");
  }

  const user = await sequelize.transaction(async (transaction) => {
    const playerRole = await Role.findOne({ where: { name: "player" }, transaction });
    if (!playerRole) {
      throw new Error("El rol player no existe. Ejecuta las migraciones antes de crear usuarios.");
    }

    const now = new Date();
    const createdUser = await User.create({
      clubId,
      email: payload.email,
      displayName: payload.displayName,
      passwordHash: await hashPassword(payload.password),
      avatar: payload.avatar ?? null,
      bio: payload.bio ?? null,
      location: payload.location ?? null,
      birthDate: payload.birthDate ?? null,
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    }, { transaction });

    await UserRole.create({ userId: createdUser.id, roleId: playerRole.id }, { transaction });
    await ClubMembership.create({
      userId: createdUser.id,
      clubId,
      roleId: playerRole.id,
      isOwner: false,
      createdAt: now,
      updatedAt: now,
    }, { transaction });

    const primaryCategory = await Category.findOne({ where: { clubId }, order: [["id", "ASC"]], transaction });
    if (!primaryCategory) {
      throw new Error("El club necesita al menos una categoria para crear un jugador.");
    }
    const player = await Player.create({
      userId: createdUser.id,
      clubId,
      name: createdUser.displayName || createdUser.email,
      position: "Sin definir",
      number: null,
      avatar: createdUser.avatar,
      bio: createdUser.bio,
      location: createdUser.location,
      birthDate: createdUser.birthDate,
      team: null,
      rosterStatus: "active",
      primaryCategoryId: primaryCategory.id,
      createdAt: now,
      updatedAt: now,
    }, { transaction });
    await PlayerCategory.create({ playerId: player.id, categoryId: primaryCategory.id }, { transaction });

    return createdUser;
  });

  return mapUser(user, scope.clubId ?? user.clubId);
};

export const updateUser = async (id, payload, scope = {}) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const user = await User.findOne({
    where: { id },
    include: scope.clubId
      ? [{ association: "memberships", where: { clubId: scope.clubId }, required: true, attributes: ["isOwner"] }]
      : [],
  });

  if (!user) {
    return null;
  }

  if (payload.isActive === false && user.memberships?.[0]?.isOwner) {
    throw new Error("La cuenta propietaria del club no se puede desactivar.");
  }
  if (payload.isActive !== undefined) {
    const membershipCount = await ClubMembership.count({ where: { userId: user.id } });
    if (membershipCount > 1) {
      throw new Error("Una cuenta de varios clubes no se puede desactivar desde un solo club.");
    }
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

  return mapUser(user, scope.clubId ?? user.clubId);
};

export const deleteUser = async (id, scope = {}) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const user = await User.findOne({
    where: { id },
    include: scope.clubId
      ? [{ association: "memberships", where: { clubId: scope.clubId }, required: true }]
      : [{ association: "memberships" }],
  });

  if (!user) {
    return false;
  }

  if (scope.clubId && user.memberships?.[0]?.isOwner) {
    throw new Error("La cuenta propietaria del club no se puede eliminar.");
  }

  const membershipCount = await ClubMembership.count({ where: { userId: user.id } });
  if (scope.clubId && membershipCount > 1) {
    await sequelize.transaction(async (transaction) => {
      await Player.update({ userId: null, updatedAt: new Date() }, {
        where: { userId: user.id, clubId: scope.clubId },
        transaction,
      });
      await ClubMembership.destroy({ where: { userId: user.id, clubId: scope.clubId }, transaction });
      if (user.clubId === scope.clubId) {
        const replacement = await ClubMembership.findOne({ where: { userId: user.id }, order: [["id", "ASC"]], transaction });
        await user.update({ clubId: replacement?.clubId ?? null, updatedAt: new Date() }, { transaction });
      }
    });
    return true;
  }

  await sequelize.transaction(async (transaction) => {
    await Player.update({ userId: null, updatedAt: new Date() }, { where: { userId: user.id }, transaction });
    await user.destroy({ transaction });
  });
  return true;
};
