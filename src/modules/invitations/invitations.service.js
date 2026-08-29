// Este archivo concentra el acceso a datos del modulo de invitaciones.
import { randomBytes } from "node:crypto";
import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import Invitation from "../../models/invitation.model.js";
import { initModelAssociations } from "../../models/associations.js";
import Player from "../../models/player.model.js";
import PlayerCategory from "../../models/player-category.model.js";
import Role from "../../models/role.model.js";
import User from "../../models/user.model.js";

const shouldUseDatabase = () => process.env.DB_READ_INVITATIONS === "true";

const ensureDatabaseEnabled = () => {
  if (!shouldUseDatabase()) {
    throw new Error("La lectura y escritura de invitaciones en base de datos esta desactivada.");
  }
};

const generateInvitationToken = () => randomBytes(24).toString("hex");

const buildInvitationIncludes = () => ([
  { association: "role" },
  { association: "player" },
  { association: "primaryCategory" },
]);

// Este mapeo deja las invitaciones con nombres de campo consistentes para el resto de la app.
const mapInvitation = (invitation) => ({
  id: invitation.id,
  email: invitation.email,
  name: invitation.name,
  roleId: invitation.roleId,
  playerId: invitation.playerId,
  primaryCategoryId: invitation.primaryCategoryId,
  status: invitation.status,
  token: invitation.token,
  expiresAt: invitation.expiresAt,
  acceptedAt: invitation.acceptedAt,
  createdAt: invitation.createdAt,
  updatedAt: invitation.updatedAt,
});

const mapInvitationDetail = (invitation) => ({
  ...mapInvitation(invitation),
  role: invitation.role
    ? {
        id: invitation.role.id,
        name: invitation.role.name,
      }
    : null,
  player: invitation.player
    ? {
        id: invitation.player.id,
        name: invitation.player.name,
        rosterStatus: invitation.player.rosterStatus,
        primaryCategoryId: invitation.player.primaryCategoryId,
      }
    : null,
  primaryCategory: invitation.primaryCategory
    ? {
        id: invitation.primaryCategory.id,
        name: invitation.primaryCategory.name,
      }
    : null,
});

export const getInvitations = async (filters = {}) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const where = {};

  if (filters.email) {
    where.email = {
      [Op.iLike]: `%${filters.email}%`,
    };
  }

  if (filters.roleId) {
    where.roleId = filters.roleId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  // Ordenamos por id para mantener un orden estable al revisar invitaciones.
  const invitations = await Invitation.findAll({
    where,
    include: buildInvitationIncludes(),
    order: [["id", "ASC"]],
  });

  return invitations.map((invitation) => mapInvitationDetail(invitation));
};

export const getInvitationById = async (id) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const invitation = await Invitation.findByPk(id, {
    include: buildInvitationIncludes(),
  });

  return invitation ? mapInvitationDetail(invitation) : null;
};

export const getInvitationByToken = async (token) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const invitation = await Invitation.findOne({
    where: { token },
    include: buildInvitationIncludes(),
  });

  return invitation ? mapInvitationDetail(invitation) : null;
};

export const createInvitation = async (payload) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const createdInvitation = await sequelize.transaction(async (transaction) => {
    const existingUser = await User.findOne({
      where: {
        email: {
          [Op.iLike]: payload.email,
        },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingUser) {
      throw new Error("Ya existe un usuario registrado con ese email.");
    }

    const existingInvitation = await Invitation.findOne({
      where: {
        email: {
          [Op.iLike]: payload.email,
        },
        status: {
          [Op.in]: ["pending", "accepted"],
        },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingInvitation?.status === "pending") {
      throw new Error("Ya existe una invitacion pendiente para ese email.");
    }

    if (existingInvitation?.status === "accepted") {
      throw new Error("Ese email ya tiene una invitacion aceptada y no se puede invitar de nuevo.");
    }

    const role = await Role.findByPk(payload.roleId, { transaction });

    if (!role) {
      throw new Error("El rol indicado para la invitacion no existe.");
    }

    let playerId = payload.playerId;

    // Si la invitacion es para un jugador y aun no existe ficha deportiva, la dejamos creada en estado invited.
    if (role.name === "player" && !playerId) {
      if (!payload.primaryCategoryId) {
        throw new Error("Las invitaciones para jugadores necesitan primaryCategoryId.");
      }

      const player = await Player.create(
        {
          userId: null,
          name: payload.name,
          position: null,
          number: null,
          avatar: null,
          bio: null,
          location: null,
          birthDate: null,
          team: "Club Prueba",
          rosterStatus: "invited",
          primaryCategoryId: payload.primaryCategoryId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { transaction },
      );

      await PlayerCategory.create(
        {
          playerId: player.id,
          categoryId: payload.primaryCategoryId,
        },
        { transaction },
      );

      playerId = player.id;
    }

    const invitation = await Invitation.create(
      {
        email: payload.email,
        name: payload.name,
        roleId: payload.roleId,
        playerId,
        primaryCategoryId: payload.primaryCategoryId,
        status: payload.status,
        token: generateInvitationToken(),
        expiresAt: payload.expiresAt,
        acceptedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { transaction },
    );

    return Invitation.findByPk(invitation.id, {
      include: buildInvitationIncludes(),
      transaction,
    });
  });

  return mapInvitationDetail(createdInvitation);
};

export const updateInvitationStatus = async (id, status) => {
  ensureDatabaseEnabled();

  initModelAssociations();

  const invitation = await Invitation.findByPk(id, {
    include: buildInvitationIncludes(),
  });

  if (!invitation) {
    return null;
  }

  await invitation.update({
    status,
    acceptedAt: status === "accepted" ? new Date() : null,
    updatedAt: new Date(),
  });

  await invitation.reload({
    include: buildInvitationIncludes(),
  });

  return mapInvitationDetail(invitation);
};
