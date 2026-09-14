// Este archivo concentra la logica de negocio del registro y login basados en invitaciones.
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "../../shared/security/password.js";
import sequelize from "../../config/db.js";
import Club from "../../models/club.model.js";
import ClubMembership from "../../models/club-membership.model.js";
import Category from "../../models/category.model.js";
import Invitation from "../../models/invitation.model.js";
import { initModelAssociations } from "../../models/associations.js";
import Player from "../../models/player.model.js";
import Role from "../../models/role.model.js";
import UserRole from "../../models/user-role.model.js";
import User from "../../models/user.model.js";

// Firmamos un token chico con la identidad basica del usuario para resolver sesion y permisos en rutas privadas.
const signAuthToken = ({ userId, email, roles, clubId }) => jwt.sign(
  {
    userId,
    email,
    roles,
    clubId,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  },
);

const mapAuthUser = (user, membership = null) => ({
  id: user.id,
  clubId: membership?.clubId ?? user.clubId,
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

const mapAuthenticatedProfile = (user, membership = null) => ({
  user: {
    ...mapAuthUser(user, membership),
    roles: membership?.role ? [{ id: membership.role.id, name: membership.role.name }] : [],
    clubs: (user.memberships ?? []).map((entry) => ({ id: entry.clubId, name: entry.club?.name, sport: entry.club?.sport, logo: entry.club?.logo, role: entry.role?.name, isOwner: entry.isOwner })),
    club: membership?.club
      ? {
          id: membership.club.id,
          name: membership.club.name,
          sport: membership.club.sport,
          location: membership.club.location,
          description: membership.club.description,
          logo: membership.club.logo,
          createdAt: membership.club.createdAt,
        }
      : null,
  },
  player: user.player
    ? {
        id: user.player.id,
        name: user.player.name,
        position: user.player.position,
        number: user.player.number,
        avatar: user.player.avatar,
        bio: user.player.bio,
        location: user.player.location,
        birthDate: user.player.birthDate,
        team: user.player.team,
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
});

const buildInvitationIncludes = () => ([
  { association: "role" },
  { association: "player" },
  { association: "primaryCategory" },
]);

const buildUserIncludes = () => ([
  { association: "roles" },
  { association: "club" },
  { association: "memberships", include: [{ association: "club" }, { association: "role" }] },
  {
    association: "player",
    include: [{ association: "primaryCategory" }],
  },
]);

export const registerFounder = async (payload, ownerUserId = null) => {
  initModelAssociations();

  const registeredSession = await sequelize.transaction(async (transaction) => {
    const existingUser = await User.findOne({
      where: ownerUserId ? { id: ownerUserId } : { email: payload.email },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingUser && !ownerUserId) {
      throw new Error("Ya existe un usuario registrado con ese correo.");
    }

    const adminRole = await Role.findOne({
      where: { name: "admin" },
      transaction,
    });

    if (!adminRole) {
      throw new Error("No existe el rol admin. Ejecuta las migraciones antes de crear el club.");
    }

    const now = new Date();
    const club = await Club.create(
      {
        name: payload.clubName,
        sport: payload.sport,
        location: payload.location,
        description: payload.description,
        logo: payload.logo,
        createdAt: now,
        updatedAt: now,
      },
      { transaction },
    );

    await Category.create(
      {
        clubId: club.id,
        name: payload.categoryName,
        genderScope: payload.categoryGenderScope,
        minAge: payload.categoryMinAge,
        maxAge: payload.categoryMaxAge,
      },
      { transaction },
    );

    const user = existingUser ?? await User.create(
      {
        clubId: club.id,
        email: payload.email,
        displayName: payload.ownerName,
        passwordHash: await hashPassword(payload.password),
        avatar: null,
        bio: `Administrador fundador de ${club.name}.`,
        location: payload.location,
        birthDate: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      { transaction },
    );

    if (!existingUser) {
      await UserRole.create({ userId: user.id, roleId: adminRole.id }, { transaction });
    }
    await ClubMembership.create({ userId: user.id, clubId: club.id, roleId: adminRole.id, isOwner: true, createdAt: now, updatedAt: now }, { transaction });

    return User.findByPk(user.id, {
      include: buildUserIncludes(),
      transaction,
    });
  });

  return mapRegisteredSession(registeredSession);
};

const mapRegisteredSession = (user, activeClubId = null) => {
  const requestedMembership = (user.memberships ?? []).find((entry) => entry.clubId === activeClubId);
  const membership = requestedMembership ?? user.memberships?.[0] ?? null;
  if (activeClubId && !requestedMembership) {
    throw new Error("No tienes acceso al club seleccionado.");
  }
  const roleNames = membership?.role ? [membership.role.name] : [];
  const token = signAuthToken({
    userId: user.id,
    email: user.email,
    roles: roleNames,
    clubId: membership?.clubId ?? null,
  });

  return {
    token,
    ...mapAuthenticatedProfile(user, membership),
  };
};

export const getAuthenticatedSession = async (userId, activeClubId = null) => {
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

  return mapRegisteredSession(user, activeClubId);
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

    const club = invitationWithRelations.clubId
      ? await Club.findByPk(invitationWithRelations.clubId, { transaction })
      : await Club.findByPk(1, { transaction });
    const now = new Date();
    const user = existingUser ?? await User.create({
      clubId: club?.id ?? null,
      email: invitation.email,
      displayName: payload.name,
      passwordHash: await hashPassword(payload.password),
      avatar: payload.avatar ?? null,
      bio: payload.bio ?? null,
      location: null,
      birthDate: payload.birthDate,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }, { transaction });

    const existingMembership = await ClubMembership.findOne({ where: { userId: user.id, clubId: club.id }, transaction });
    if (existingMembership) {
      throw new Error("Ya perteneces a este club.");
    }
    await ClubMembership.create({ userId: user.id, clubId: club.id, roleId: invitationWithRelations.roleId, isOwner: false, createdAt: now, updatedAt: now }, { transaction });
    if (!existingUser) {
      await UserRole.create({ userId: user.id, roleId: invitationWithRelations.roleId }, { transaction });
    }

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

  const verification = await verifyPassword(payload.password, user.passwordHash);

  if (!verification.ok) {
    throw new Error("Credenciales invalidas.");
  }

  if (!user.isActive) {
    throw new Error("La cuenta del usuario esta inactiva.");
  }

  // Migración progresiva: cuentas legacy sha256 se re-hashean a bcrypt en el login.
  if (verification.needsRehash) {
    await user.update({ passwordHash: await hashPassword(payload.password), updatedAt: new Date() }).catch(() => {});
  }

  return mapRegisteredSession(user);
};

export const updateAuthenticatedUserAvatar = async (userId, avatarPath) => {
  initModelAssociations();

  const updatedProfile = await sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user) {
      throw new Error("El usuario autenticado no existe.");
    }

    if (!user.isActive) {
      throw new Error("La cuenta del usuario esta inactiva.");
    }

    await user.update(
      {
        avatar: avatarPath,
        updatedAt: new Date(),
      },
      { transaction },
    );

    const player = await Player.findOne({
      where: { userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (player) {
      await player.update(
        {
          avatar: avatarPath,
          updatedAt: new Date(),
        },
        { transaction },
      );
    }

    return User.findByPk(userId, {
      include: buildUserIncludes(),
      transaction,
    });
  });

  return mapAuthenticatedProfile(updatedProfile);
};

export const updateAuthenticatedUserProfile = async (userId, payload) => {
  initModelAssociations();

  const updatedProfile = await sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user) {
      throw new Error("El usuario autenticado no existe.");
    }

    await user.update(
      {
        displayName: payload.displayName ?? user.displayName,
        bio: payload.bio ?? user.bio,
        location: payload.location ?? user.location,
        birthDate: payload.birthDate ?? user.birthDate,
        updatedAt: new Date(),
      },
      { transaction },
    );

    const player = await Player.findOne({
      where: { userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (player) {
      await player.update(
        {
          name: payload.displayName ?? player.name,
          bio: payload.bio ?? player.bio,
          location: payload.location ?? player.location,
          birthDate: payload.birthDate ?? player.birthDate,
          updatedAt: new Date(),
        },
        { transaction },
      );
    }

    return User.findByPk(userId, {
      include: buildUserIncludes(),
      transaction,
    });
  });

  return mapAuthenticatedProfile(updatedProfile);
};

export const updateAuthenticatedUserEmail = async (userId, payload) => {
  initModelAssociations();

  const updatedProfile = await sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user) {
      throw new Error("El usuario autenticado no existe.");
    }

    if (user.email.toLowerCase() !== payload.currentEmail) {
      throw new Error("El correo actual no coincide con el registrado en la cuenta.");
    }

    const existingUser = await User.findOne({
      where: { email: payload.newEmail },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingUser && existingUser.id !== user.id) {
      throw new Error("Ya existe un usuario registrado con ese email.");
    }

    await user.update(
      {
        email: payload.newEmail,
        updatedAt: new Date(),
      },
      { transaction },
    );

    return User.findByPk(userId, {
      include: buildUserIncludes(),
      transaction,
    });
  });

  return mapRegisteredSession(updatedProfile);
};

export const updateAuthenticatedUserPassword = async (userId, payload) => {
  initModelAssociations();

  const updated = await sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user) {
      throw new Error("El usuario autenticado no existe.");
    }

    if (!user.isActive) {
      throw new Error("La cuenta del usuario esta inactiva.");
    }

    const verification = await verifyPassword(payload.currentPassword, user.passwordHash);

    if (!verification.ok) {
      throw new Error("La password actual no coincide con la registrada.");
    }

    await user.update(
      {
        passwordHash: await hashPassword(payload.newPassword),
        updatedAt: new Date(),
      },
      { transaction },
    );

    return true;
  });

  return updated;
};
