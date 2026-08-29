// Este archivo concentra la logica de negocio del registro y login basados en invitaciones.
import { createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import sequelize from "../../config/db.js";
import Invitation from "../../models/invitation.model.js";
import { initModelAssociations } from "../../models/associations.js";
import Player from "../../models/player.model.js";
import UserRole from "../../models/user-role.model.js";
import User from "../../models/user.model.js";

const hashPassword = (password) => createHash("sha256").update(password).digest("hex");

// Firmamos un token chico con la identidad basica del usuario para resolver sesion y permisos en rutas privadas.
const signAuthToken = ({ userId, email, roles }) => jwt.sign(
  {
    userId,
    email,
    roles,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
);

const mapAuthUser = (user) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  avatar: user.avatar,
  bio: user.bio,
  location: user.location,
  birthDate: user.birthDate,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildInvitationIncludes = () => ([
  { association: "role" },
  { association: "player" },
  { association: "primaryCategory" },
]);

const buildUserIncludes = () => ([
  { association: "roles" },
  {
    association: "player",
    include: [{ association: "primaryCategory" }],
  },
]);

const mapRegisteredSession = (user) => {
  const roleNames = (user.roles ?? []).map((role) => role.name);
  const token = signAuthToken({
    userId: user.id,
    email: user.email,
    roles: roleNames,
  });

  return {
    token,
    user: {
      ...mapAuthUser(user),
      roles: (user.roles ?? []).map((role) => ({ id: role.id, name: role.name })),
    },
    player: user.player
      ? {
          id: user.player.id,
          name: user.player.name,
          position: user.player.position,
          number: user.player.number,
          avatar: user.player.avatar,
          bio: user.player.bio,
          birthDate: user.player.birthDate,
          rosterStatus: user.player.rosterStatus,
          primaryCategoryId: user.player.primaryCategoryId,
          primaryCategory: user.player.primaryCategory
            ? {
                id: user.player.primaryCategory.id,
                name: user.player.primaryCategory.name,
              }
            : null,
        }
      : null,
  };
};

export const getAuthenticatedSession = async (userId) => {
  initModelAssociations();

  const user = await User.findByPk(userId, {
    include: buildUserIncludes(),
  });

  if (!user) {
    throw new Error("El usuario autenticado no existe.");
  }

  if (!user.isActive) {
    throw new Error("La cuenta del usuario esta inactiva.");
  }

  return mapRegisteredSession(user);
};

export const registerWithInvitation = async (payload) => {
  initModelAssociations();

  const registeredSession = await sequelize.transaction(async (transaction) => {
    const invitation = await Invitation.findOne({
      where: { token: payload.token },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!invitation) {
      throw new Error("La invitacion no existe.");
    }

    if (invitation.status !== "pending") {
      throw new Error("La invitacion ya no esta disponible para registrarse.");
    }

    if (new Date(invitation.expiresAt).getTime() < Date.now()) {
      throw new Error("La invitacion ya expiro.");
    }

    const invitationWithRelations = await Invitation.findByPk(invitation.id, {
      include: buildInvitationIncludes(),
      transaction,
    });

    const existingUser = await User.findOne({
      where: { email: invitation.email },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingUser) {
      throw new Error("Ya existe un usuario registrado con ese email.");
    }

    const user = await User.create(
      {
        email: invitation.email,
        displayName: payload.name,
        passwordHash: hashPassword(payload.password),
        avatar: payload.avatar ?? null,
        bio: payload.bio ?? null,
        location: null,
        birthDate: payload.birthDate,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { transaction },
    );

    await UserRole.create(
      {
        userId: user.id,
        roleId: invitationWithRelations.roleId,
      },
      { transaction },
    );

    if (invitationWithRelations.playerId) {
      const player = await Player.findByPk(invitationWithRelations.playerId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!player) {
        throw new Error("La invitacion referencia un jugador que no existe.");
      }

      // Al aceptar la invitacion completamos la ficha deportiva con los datos que el jugador carga en su registro.
      await player.update(
        {
          userId: user.id,
          name: payload.name,
          position: payload.position,
          number: payload.number ?? null,
          avatar: payload.avatar ?? null,
          bio: payload.bio ?? null,
          birthDate: payload.birthDate,
          rosterStatus: "active",
          updatedAt: new Date(),
        },
        { transaction },
      );
    }

    await invitation.update(
      {
        status: "accepted",
        acceptedAt: new Date(),
        updatedAt: new Date(),
      },
      { transaction },
    );

    return User.findByPk(user.id, {
      include: buildUserIncludes(),
      transaction,
    });
  });

  return mapRegisteredSession(registeredSession);
};

export const loginWithCredentials = async (payload) => {
  initModelAssociations();

  const user = await User.findOne({
    where: { email: payload.email },
    include: buildUserIncludes(),
  });

  if (!user) {
    throw new Error("Credenciales invalidas.");
  }

  if (user.passwordHash !== hashPassword(payload.password)) {
    throw new Error("Credenciales invalidas.");
  }

  if (!user.isActive) {
    throw new Error("La cuenta del usuario esta inactiva.");
  }

  return mapRegisteredSession(user);
};
