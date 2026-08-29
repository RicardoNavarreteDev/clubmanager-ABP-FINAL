// Este archivo valida los filtros y payloads que entran al modulo API de invitaciones.
const ALLOWED_INVITATION_STATUSES = ["pending", "accepted", "expired", "cancelled"];

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

export const validateInvitationId = (id) => {
  const parsedId = Number.parseInt(id, 10);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new Error("El id de la invitacion debe ser un numero entero positivo.");
  }

  return parsedId;
};

export const validateInvitationToken = (token) => {
  if (!isNonEmptyString(token)) {
    throw new Error("El token de la invitacion es obligatorio.");
  }

  return token.trim();
};

export const validateInvitationFilters = (filters) => {
  const sanitizedFilters = {};

  if (typeof filters.email === "string" && filters.email.trim()) {
    sanitizedFilters.email = filters.email.trim().toLowerCase();
  }

  if (filters.roleId !== undefined && String(filters.roleId).trim()) {
    const parsedRoleId = Number.parseInt(filters.roleId, 10);

    if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
      throw new Error("roleId debe ser un numero entero positivo.");
    }

    sanitizedFilters.roleId = parsedRoleId;
  }

  if (typeof filters.status === "string" && filters.status.trim()) {
    const normalizedStatus = filters.status.trim().toLowerCase();

    if (!ALLOWED_INVITATION_STATUSES.includes(normalizedStatus)) {
      throw new Error(`status debe ser uno de estos valores: ${ALLOWED_INVITATION_STATUSES.join(", ")}.`);
    }

    sanitizedFilters.status = normalizedStatus;
  }

  return sanitizedFilters;
};

export const validateCreateInvitationPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Debes enviar un body JSON valido para crear la invitacion.");
  }

  if (!isNonEmptyString(payload.email) || !payload.email.includes("@")) {
    throw new Error("El email es obligatorio y debe tener un formato valido.");
  }

  if (!isNonEmptyString(payload.name)) {
    throw new Error("El nombre de la invitacion es obligatorio.");
  }

  const parsedRoleId = Number.parseInt(payload.roleId, 10);

  if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
    throw new Error("roleId es obligatorio y debe ser un numero entero positivo.");
  }

  let playerId = null;

  if (payload.playerId !== undefined && payload.playerId !== null && payload.playerId !== "") {
    const parsedPlayerId = Number.parseInt(payload.playerId, 10);

    if (!Number.isInteger(parsedPlayerId) || parsedPlayerId <= 0) {
      throw new Error("Si envias playerId, debe ser un numero entero positivo.");
    }

    playerId = parsedPlayerId;
  }

  let primaryCategoryId = null;

  if (payload.primaryCategoryId !== undefined && payload.primaryCategoryId !== null && payload.primaryCategoryId !== "") {
    const parsedPrimaryCategoryId = Number.parseInt(payload.primaryCategoryId, 10);

    if (!Number.isInteger(parsedPrimaryCategoryId) || parsedPrimaryCategoryId <= 0) {
      throw new Error("Si envias primaryCategoryId, debe ser un numero entero positivo.");
    }

    primaryCategoryId = parsedPrimaryCategoryId;
  }

  let expiresAt;

  if (payload.expiresAt !== undefined) {
    expiresAt = new Date(payload.expiresAt);

    if (Number.isNaN(expiresAt.getTime())) {
      throw new Error("Si envias expiresAt, debe ser una fecha valida.");
    }
  } else {
    expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  }

  return {
    email: payload.email.trim().toLowerCase(),
    name: payload.name.trim(),
    roleId: parsedRoleId,
    playerId,
    primaryCategoryId,
    expiresAt,
    status: "pending",
  };
};

export const validateInvitationStatusPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Debes enviar un body JSON valido para cambiar el estado de la invitacion.");
  }

  if (!isNonEmptyString(payload.status)) {
    throw new Error("status es obligatorio.");
  }

  const normalizedStatus = payload.status.trim().toLowerCase();

  if (!ALLOWED_INVITATION_STATUSES.includes(normalizedStatus)) {
    throw new Error(`status debe ser uno de estos valores: ${ALLOWED_INVITATION_STATUSES.join(", ")}.`);
  }

  return {
    status: normalizedStatus,
  };
};
