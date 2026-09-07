const postTypes = new Set(["text", "photo", "poll", "event", "announcement"]);

const badRequest = (message) => Object.assign(new Error(message), { statusCode: 400 });

const optionalText = (value, field, maxLength) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw badRequest(`${field} debe ser texto.`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw badRequest(`${field} no puede superar ${maxLength} caracteres.`);
  return normalized || null;
};

export const validateId = (value, field = "id") => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw badRequest(`${field} debe ser un entero positivo.`);
  return id;
};

export const validateFeedQuery = (query = {}) => {
  const page = query.page === undefined ? 1 : validateId(query.page, "page");
  const limit = query.limit === undefined ? 20 : validateId(query.limit, "limit");
  if (limit > 50) throw badRequest("limit no puede superar 50.");
  return { page, limit };
};

const parseOptions = (options) => {
  if (typeof options === "string") {
    try {
      return JSON.parse(options);
    } catch {
      throw badRequest("pollOptions debe ser un arreglo JSON valido.");
    }
  }
  return options;
};

export const validateCreatePostPayload = (body, imageUrl = null) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw badRequest("Debes enviar los datos de la publicacion.");
  }

  const type = typeof body.type === "string" ? body.type.trim().toLowerCase() : "";
  if (!postTypes.has(type)) throw badRequest("type debe ser text, photo, poll, event o announcement.");

  const content = optionalText(body.content, "content", 5000);
  const payload = {
    type,
    content,
    imageUrl,
    eventTitle: optionalText(body.eventTitle, "eventTitle", 160),
    eventLocation: optionalText(body.eventLocation, "eventLocation", 200),
    eventStartAt: null,
    pollQuestion: null,
    pollOptions: null,
  };

  if ((type === "text" || type === "announcement") && !content) {
    throw badRequest("content es obligatorio para esta publicacion.");
  }
  if (type === "photo" && !imageUrl) throw badRequest("Debes enviar una imagen en el campo image.");
  if (type !== "photo" && imageUrl) throw badRequest("Solo las publicaciones photo pueden incluir una imagen.");

  if (type === "event") {
    if (!payload.eventTitle) throw badRequest("eventTitle es obligatorio para un evento.");
    const eventDate = new Date(body.eventStartAt);
    if (!body.eventStartAt || Number.isNaN(eventDate.getTime())) {
      throw badRequest("eventStartAt debe ser una fecha valida.");
    }
    payload.eventStartAt = eventDate;
  }

  if (type === "poll") {
    payload.pollQuestion = optionalText(body.pollQuestion, "pollQuestion", 300);
    if (!payload.pollQuestion) throw badRequest("pollQuestion es obligatorio para una encuesta.");
    const options = parseOptions(body.pollOptions);
    if (!Array.isArray(options) || options.length < 2 || options.length > 10) {
      throw badRequest("pollOptions debe contener entre 2 y 10 opciones.");
    }
    payload.pollOptions = options.map((option) => optionalText(option, "Cada opcion", 120));
    if (payload.pollOptions.some((option) => !option)) throw badRequest("Las opciones no pueden estar vacias.");
    const uniqueOptions = new Set(payload.pollOptions.map((option) => option.toLowerCase()));
    if (uniqueOptions.size !== payload.pollOptions.length) throw badRequest("Las opciones de la encuesta no pueden repetirse.");
  }

  return payload;
};

export const validateCommentPayload = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw badRequest("Debes enviar los datos del comentario.");
  }
  const content = optionalText(body.content, "content", 2000);
  if (!content) throw badRequest("content es obligatorio.");
  return { content };
};

export const validateVotePayload = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw badRequest("Debes enviar los datos del voto.");
  }
  return { optionId: validateId(body.optionId, "optionId") };
};
