// Este archivo valida los filtros y payloads que entran al modulo API de jugadores.
const ALLOWED_ROSTER_STATUSES = ["invited", "active", "inactive"];

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const normalizeOptionalString = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length ? trimmedValue : null;
};

export const validatePlayerId = (id) => {
  const parsedId = Number.parseInt(id, 10);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new Error("El id del jugador debe ser un numero entero positivo.");
  }

  return parsedId;
};

export const validatePlayerFilters = (filters) => {
  const sanitizedFilters = {};

  if (typeof filters.name === "string" && filters.name.trim()) {
    sanitizedFilters.name = filters.name.trim();
  }

  if (filters.primaryCategoryId !== undefined && String(filters.primaryCategoryId).trim()) {
    const parsedCategoryId = Number.parseInt(filters.primaryCategoryId, 10);

    if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
      throw new Error("primaryCategoryId debe ser un numero entero positivo.");
    }

    sanitizedFilters.primaryCategoryId = parsedCategoryId;
  }

  if (typeof filters.rosterStatus === "string" && filters.rosterStatus.trim()) {
    const normalizedStatus = filters.rosterStatus.trim().toLowerCase();

    if (!ALLOWED_ROSTER_STATUSES.includes(normalizedStatus)) {
      throw new Error(`rosterStatus debe ser uno de estos valores: ${ALLOWED_ROSTER_STATUSES.join(", ")}.`);
    }

    sanitizedFilters.rosterStatus = normalizedStatus;
  }

  return sanitizedFilters;
};

export const validateUpdatePlayerPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Debes enviar un body JSON valido para actualizar el jugador.");
  }

  const sanitizedPayload = {};

  if (payload.name !== undefined) {
    if (!isNonEmptyString(payload.name)) {
      throw new Error("Si envias name, no puede venir vacio.");
    }

    sanitizedPayload.name = payload.name.trim();
  }

  if (payload.position !== undefined) {
    sanitizedPayload.position = normalizeOptionalString(payload.position);
  }

  if (payload.number !== undefined) {
    if (payload.number === null || payload.number === "") {
      sanitizedPayload.number = null;
    } else {
      const parsedNumber = Number.parseInt(payload.number, 10);

      if (!Number.isInteger(parsedNumber) || parsedNumber < 0) {
        throw new Error("Si envias number, debe ser un numero entero igual o mayor a 0.");
      }

      sanitizedPayload.number = parsedNumber;
    }
  }

  if (payload.avatar !== undefined) {
    sanitizedPayload.avatar = normalizeOptionalString(payload.avatar);
  }

  if (payload.bio !== undefined) {
    sanitizedPayload.bio = normalizeOptionalString(payload.bio);
  }

  if (payload.location !== undefined) {
    sanitizedPayload.location = normalizeOptionalString(payload.location);
  }

  if (payload.birthDate !== undefined) {
    sanitizedPayload.birthDate = normalizeOptionalString(payload.birthDate);
  }

  if (payload.team !== undefined || payload.primaryCategoryId !== undefined || payload.userId !== undefined || payload.rosterStatus !== undefined) {
    throw new Error("team, primaryCategoryId, userId y rosterStatus no se editan desde este endpoint.");
  }

  if (Object.keys(sanitizedPayload).length === 0) {
    throw new Error("Debes enviar al menos un campo valido para actualizar el jugador.");
  }

  return sanitizedPayload;
};

export const validatePlayerStatusPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Debes enviar un body JSON valido para cambiar el estado del jugador.");
  }

  if (!isNonEmptyString(payload.rosterStatus)) {
    throw new Error("rosterStatus es obligatorio.");
  }

  const normalizedStatus = payload.rosterStatus.trim().toLowerCase();

  if (!ALLOWED_ROSTER_STATUSES.includes(normalizedStatus)) {
    throw new Error(`rosterStatus debe ser uno de estos valores: ${ALLOWED_ROSTER_STATUSES.join(", ")}.`);
  }

  return {
    rosterStatus: normalizedStatus,
  };
};
