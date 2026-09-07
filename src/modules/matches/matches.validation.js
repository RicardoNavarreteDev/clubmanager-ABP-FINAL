// Este archivo valida las altas web de partidos.
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const validateCreateMatchPayload = (payload) => {
  for (const [field, message] of [
    ["opponent", "El rival es obligatorio."],
    ["date", "La fecha es obligatoria."],
    ["time", "La hora es obligatoria."],
    ["location", "La ubicacion es obligatoria."],
    ["condition", "La condicion es obligatoria."],
  ]) {
    if (!isNonEmptyString(payload?.[field])) {
      throw new Error(message);
    }
  }

  if (payload.opponent.trim().length > 120) {
    throw new Error("El rival no puede superar 120 caracteres.");
  }

  if (payload.location.trim().length > 160) {
    throw new Error("La ubicacion no puede superar 160 caracteres.");
  }

  const parsedDate = new Date(`${payload.date}T00:00:00Z`);
  if (!ISO_DATE_PATTERN.test(payload.date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== payload.date) {
    throw new Error("La fecha debe tener formato AAAA-MM-DD y ser valida.");
  }

  if (!TIME_PATTERN.test(payload.time)) {
    throw new Error("La hora debe tener formato HH:MM.");
  }

  if (!["local", "visita"].includes(payload.condition)) {
    throw new Error("La condicion debe ser local o visita.");
  }

  let championshipId = null;
  if (payload.championshipId !== undefined && payload.championshipId !== null && String(payload.championshipId).trim() !== "") {
    championshipId = Number(payload.championshipId);
    if (!Number.isInteger(championshipId) || championshipId <= 0) {
      throw new Error("El campeonato debe ser valido.");
    }
  }

  return {
    opponent: payload.opponent.trim(),
    date: payload.date,
    time: payload.time,
    location: payload.location.trim(),
    condition: payload.condition,
    championshipId,
  };
};
