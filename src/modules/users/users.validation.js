// Este archivo va a concentrar las validaciones de entrada del modulo de usuarios.

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const normalizeOptionalString = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length ? trimmedValue : null;
};

const parseBooleanString = (value, fieldName) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === "true") {
      return true;
    }

    if (normalizedValue === "false") {
      return false;
    }
  }

  throw new Error(`El campo ${fieldName} debe ser true o false.`);
};

export const validateUserId = (id) => {
  const parsedId = Number.parseInt(id, 10);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new Error("El id del usuario debe ser un numero entero positivo.");
  }

  return parsedId;
};

export const validateUserFilters = (filters) => {
  const sanitizedFilters = {};

  if (typeof filters.email === "string" && filters.email.trim()) {
    sanitizedFilters.email = filters.email.trim();
  }

  if (typeof filters.displayName === "string" && filters.displayName.trim()) {
    sanitizedFilters.displayName = filters.displayName.trim();
  }

  if (typeof filters.isActive === "string" && filters.isActive.trim()) {
    sanitizedFilters.isActive = parseBooleanString(filters.isActive, "isActive");
  }

  return sanitizedFilters;
};

export const validateCreateUserPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Debes enviar un body JSON valido para crear el usuario.");
  }

  if (!isNonEmptyString(payload.email) || !payload.email.includes("@")) {
    throw new Error("El email es obligatorio y debe tener un formato valido.");
  }

  if (!isNonEmptyString(payload.displayName)) {
    throw new Error("El displayName es obligatorio.");
  }

  if (!isNonEmptyString(payload.password) || payload.password.trim().length < 6) {
    throw new Error("La password es obligatoria y debe tener al menos 6 caracteres.");
  }

  return {
    email: payload.email.trim().toLowerCase(),
    displayName: payload.displayName.trim(),
    password: payload.password.trim(),
    avatar: normalizeOptionalString(payload.avatar),
    bio: normalizeOptionalString(payload.bio),
    location: normalizeOptionalString(payload.location),
    birthDate: normalizeOptionalString(payload.birthDate),
    isActive: payload.isActive === undefined ? true : parseBooleanString(payload.isActive, "isActive"),
  };
};

export const validateUpdateUserPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Debes enviar un body JSON valido para actualizar el usuario.");
  }

  const sanitizedPayload = {};

  if (payload.displayName !== undefined) {
    if (!isNonEmptyString(payload.displayName)) {
      throw new Error("Si envias displayName, no puede venir vacio.");
    }

    sanitizedPayload.displayName = payload.displayName.trim();
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

  if (payload.isActive !== undefined) {
    sanitizedPayload.isActive = parseBooleanString(payload.isActive, "isActive");
  }

  if (payload.password !== undefined) {
    if (!isNonEmptyString(payload.password) || payload.password.trim().length < 6) {
      throw new Error("Si envias password, debe tener al menos 6 caracteres.");
    }

    sanitizedPayload.password = payload.password.trim();
  }

  if (Object.keys(sanitizedPayload).length === 0) {
    throw new Error("Debes enviar al menos un campo valido para actualizar el usuario.");
  }

  return sanitizedPayload;
};
