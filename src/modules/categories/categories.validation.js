// Este archivo valida las altas web de categorias.
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

export const validateCreateCategoryPayload = (payload) => {
  if (!isNonEmptyString(payload?.name)) {
    throw new Error("El nombre de la categoria es obligatorio.");
  }

  if (payload.name.trim().length > 60) {
    throw new Error("El nombre de la categoria no puede superar 60 caracteres.");
  }

  if (!isNonEmptyString(payload.genderScope)) {
    throw new Error("El alcance de genero es obligatorio.");
  }

  if (payload.genderScope.trim().length > 30) {
    throw new Error("El alcance de genero no puede superar 30 caracteres.");
  }

  const minAge = Number(payload.minAge);
  if (!Number.isInteger(minAge) || minAge < 0) {
    throw new Error("La edad minima debe ser un numero entero mayor o igual a cero.");
  }

  let maxAge = null;
  if (payload.maxAge !== undefined && payload.maxAge !== null && String(payload.maxAge).trim() !== "") {
    maxAge = Number(payload.maxAge);
    if (!Number.isInteger(maxAge) || maxAge < minAge) {
      throw new Error("La edad maxima debe ser un numero entero mayor o igual a la edad minima.");
    }
  }

  return {
    name: payload.name.trim(),
    genderScope: payload.genderScope.trim(),
    minAge,
    maxAge,
  };
};
