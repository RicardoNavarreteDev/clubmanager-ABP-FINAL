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

const ensureValidDateString = (value, fieldName) => {
  if (value === null) {
    return null;
  }

  if (!isNonEmptyString(value)) {
    throw new Error(`${fieldName} debe ser una fecha valida.`);
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`${fieldName} debe ser una fecha valida.`);
  }

  return value.trim();
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

export const validateFounderRegisterPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Debes completar los datos para crear tu club.");
  }

  if (!isNonEmptyString(payload.ownerName)) {
    throw new Error("El nombre del administrador es obligatorio.");
  }

  if (!isNonEmptyString(payload.email) || !payload.email.includes("@")) {
    throw new Error("El correo debe tener un formato valido.");
  }

  if (!isNonEmptyString(payload.password) || payload.password.trim().length < 8) {
    throw new Error("La password debe tener al menos 8 caracteres.");
  }

  if (payload.password.trim() !== String(payload.confirmPassword ?? "").trim()) {
    throw new Error("Las passwords deben coincidir.");
  }

  if (!isNonEmptyString(payload.clubName)) {
    throw new Error("El nombre del club es obligatorio.");
  }

  if (!isNonEmptyString(payload.sport)) {
    throw new Error("El deporte del club es obligatorio.");
  }

  if (!isNonEmptyString(payload.categoryName)) {
    throw new Error("La primera categoria es obligatoria.");
  }

  if (!isNonEmptyString(payload.categoryGenderScope)) {
    throw new Error("El alcance de genero de la categoria es obligatorio.");
  }

  const categoryMinAge = Number.parseInt(payload.categoryMinAge, 10);
  const categoryMaxAge = payload.categoryMaxAge === "" || payload.categoryMaxAge === undefined
    ? null
    : Number.parseInt(payload.categoryMaxAge, 10);

  if (!Number.isInteger(categoryMinAge) || categoryMinAge < 0) {
    throw new Error("La edad minima de la categoria debe ser valida.");
  }

  if (categoryMaxAge !== null && (!Number.isInteger(categoryMaxAge) || categoryMaxAge < categoryMinAge)) {
    throw new Error("La edad maxima no puede ser menor que la edad minima.");
  }

  return {
    ownerName: payload.ownerName.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password.trim(),
    clubName: payload.clubName.trim(),
    sport: payload.sport.trim(),
    categoryName: payload.categoryName.trim(),
    categoryGenderScope: payload.categoryGenderScope.trim(),
    categoryMinAge,
    categoryMaxAge,
    location: normalizeOptionalString(payload.location),
    description: normalizeOptionalString(payload.description),
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

export const validateUpdateProfilePayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Debes enviar un body JSON valido para actualizar el perfil.");
  }

  const sanitizedPayload = {};

  if (payload.displayName !== undefined) {
    if (!isNonEmptyString(payload.displayName)) {
      throw new Error("displayName no puede venir vacio.");
    }

    sanitizedPayload.displayName = payload.displayName.trim();
  }

  if (payload.bio !== undefined) {
    sanitizedPayload.bio = normalizeOptionalString(payload.bio);
  }

  if (payload.location !== undefined) {
    sanitizedPayload.location = normalizeOptionalString(payload.location);
  }

  if (payload.birthDate !== undefined) {
    sanitizedPayload.birthDate = payload.birthDate === null || payload.birthDate === ""
      ? null
      : ensureValidDateString(payload.birthDate, "birthDate");
  }

  if (Object.keys(sanitizedPayload).length === 0) {
    throw new Error("Debes enviar al menos un campo valido para actualizar el perfil.");
  }

  return sanitizedPayload;
};

export const validateChangeEmailPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Debes enviar un body JSON valido para actualizar el correo.");
  }

  if (!isNonEmptyString(payload.currentEmail) || !payload.currentEmail.includes("@")) {
    throw new Error("currentEmail es obligatorio y debe tener un formato valido.");
  }

  if (!isNonEmptyString(payload.newEmail) || !payload.newEmail.includes("@")) {
    throw new Error("newEmail es obligatorio y debe tener un formato valido.");
  }

  if (!isNonEmptyString(payload.confirmEmail)) {
    throw new Error("confirmEmail es obligatorio.");
  }

  if (payload.newEmail.trim().toLowerCase() !== payload.confirmEmail.trim().toLowerCase()) {
    throw new Error("newEmail y confirmEmail deben coincidir.");
  }

  if (payload.currentEmail.trim().toLowerCase() === payload.newEmail.trim().toLowerCase()) {
    throw new Error("El nuevo correo debe ser distinto del actual.");
  }

  return {
    currentEmail: payload.currentEmail.trim().toLowerCase(),
    newEmail: payload.newEmail.trim().toLowerCase(),
  };
};

export const validateChangePasswordPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Debes enviar un body JSON valido para actualizar la password.");
  }

  if (!isNonEmptyString(payload.currentPassword)) {
    throw new Error("currentPassword es obligatoria.");
  }

  if (!isNonEmptyString(payload.newPassword) || payload.newPassword.trim().length < 8) {
    throw new Error("newPassword es obligatoria y debe tener al menos 8 caracteres.");
  }

  if (!isNonEmptyString(payload.confirmPassword)) {
    throw new Error("confirmPassword es obligatoria.");
  }

  if (payload.newPassword.trim() !== payload.confirmPassword.trim()) {
    throw new Error("newPassword y confirmPassword deben coincidir.");
  }

  if (payload.currentPassword.trim() === payload.newPassword.trim()) {
    throw new Error("La nueva password debe ser distinta de la actual.");
  }

  return {
    currentPassword: payload.currentPassword.trim(),
    newPassword: payload.newPassword.trim(),
  };
};
