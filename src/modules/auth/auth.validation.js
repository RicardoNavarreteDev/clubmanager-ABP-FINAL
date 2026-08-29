// Este archivo valida los payloads que entran al modulo de autenticacion.
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const normalizeOptionalString = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length ? trimmedValue : null;
};

const parseOptionalNumber = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const parsedNumber = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedNumber) || parsedNumber < 0) {
    throw new Error("Si envias number, debe ser un numero entero igual o mayor a 0.");
  }

  return parsedNumber;
};

export const validateRegisterPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Debes enviar un body JSON valido para registrarte.");
  }

  if (!isNonEmptyString(payload.token)) {
    throw new Error("El token de invitacion es obligatorio.");
  }

  if (!isNonEmptyString(payload.password) || payload.password.trim().length < 6) {
    throw new Error("La password es obligatoria y debe tener al menos 6 caracteres.");
  }

  if (!isNonEmptyString(payload.confirmPassword)) {
    throw new Error("confirmPassword es obligatoria.");
  }

  if (payload.password.trim() !== payload.confirmPassword.trim()) {
    throw new Error("La password y confirmPassword deben coincidir.");
  }

  if (!isNonEmptyString(payload.name)) {
    throw new Error("El nombre es obligatorio.");
  }

  if (!isNonEmptyString(payload.birthDate)) {
    throw new Error("birthDate es obligatoria.");
  }

  const parsedBirthDate = new Date(payload.birthDate);

  if (Number.isNaN(parsedBirthDate.getTime())) {
    throw new Error("birthDate debe ser una fecha valida.");
  }

  if (!isNonEmptyString(payload.position)) {
    throw new Error("La posicion es obligatoria.");
  }

  return {
    token: payload.token.trim(),
    password: payload.password.trim(),
    name: payload.name.trim(),
    birthDate: payload.birthDate.trim(),
    position: payload.position.trim(),
    number: parseOptionalNumber(payload.number),
    avatar: normalizeOptionalString(payload.avatar),
    bio: normalizeOptionalString(payload.bio),
  };
};

export const validateLoginPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Debes enviar un body JSON valido para iniciar sesion.");
  }

  if (!isNonEmptyString(payload.email) || !payload.email.includes("@")) {
    throw new Error("El email es obligatorio y debe tener un formato valido.");
  }

  if (!isNonEmptyString(payload.password)) {
    throw new Error("La password es obligatoria.");
  }

  return {
    email: payload.email.trim().toLowerCase(),
    password: payload.password.trim(),
  };
};
