// Este archivo prepara la informacion de campeonatos y su cantidad de jugadores.
import { getPlayerChampionships } from "../player-championships/player-championships.service.js";
import { getCategories, getCategoryById } from "../categories/categories.service.js";
import { createChampionship, getChampionships } from "./championships.service.js";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const getCurrentClubId = (req) => req.authSession?.user?.clubId ?? req.authSession?.user?.club?.id ?? null;

const validateDate = (value, label) => {
  const date = new Date(`${value}T00:00:00Z`);
  if (!ISO_DATE_PATTERN.test(value) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} debe tener formato AAAA-MM-DD y ser valida.`);
  }

  return value;
};

const validateCreatePayload = (payload) => {
  for (const [field, message] of [
    ["name", "El nombre es obligatorio."],
    ["season", "La temporada es obligatoria."],
    ["description", "La descripcion es obligatoria."],
    ["primaryVenue", "La sede principal es obligatoria."],
    ["startDate", "La fecha de inicio es obligatoria."],
    ["endDate", "La fecha de termino es obligatoria."],
  ]) {
    if (!isNonEmptyString(payload?.[field])) {
      throw new Error(message);
    }
  }

  if (payload.name.trim().length > 120) {
    throw new Error("El nombre no puede superar 120 caracteres.");
  }

  if (payload.season.trim().length > 20) {
    throw new Error("La temporada no puede superar 20 caracteres.");
  }

  if (payload.primaryVenue.trim().length > 160) {
    throw new Error("La sede principal no puede superar 160 caracteres.");
  }

  const categoryId = Number(payload.categoryId);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("La categoria es obligatoria y debe ser valida.");
  }

  const startDate = validateDate(payload.startDate, "La fecha de inicio");
  const endDate = validateDate(payload.endDate, "La fecha de termino");
  if (endDate < startDate) {
    throw new Error("La fecha de termino no puede ser anterior a la fecha de inicio.");
  }

  return {
    name: payload.name.trim(),
    season: payload.season.trim(),
    categoryId,
    description: payload.description.trim(),
    primaryVenue: payload.primaryVenue.trim(),
    isVariableVenue: ["true", "on", "1"].includes(payload.isVariableVenue),
    startDate,
    endDate,
  };
};

const renderCreationForm = async (req, res, options = {}) => {
  const clubId = getCurrentClubId(req);
  const categories = clubId ? await getCategories({ clubId }) : [];

  res.status(options.status ?? 200).render("categories", {
    pageTitle: "Crear campeonato",
    isChampionshipForm: true,
    categories,
    values: options.values ?? {},
    error: options.error,
  });
};

export const renderChampionships = async (req, res) => {
  // Cruzamos campeonatos con categorias y relaciones de jugadores para dejar la vista ya resuelta.
  const clubId = getCurrentClubId(req);
  const shouldLoadData = Boolean(clubId) || res.locals.shouldShowDemoData;
  const scope = clubId ? { clubId } : undefined;
  const championships = shouldLoadData ? await getChampionships(scope) : [];
  const playerChampionships = shouldLoadData ? await getPlayerChampionships() : [];
  const categories = shouldLoadData ? await getCategories(scope) : [];

  const getStatusMeta = (status) => {
    if (status === "active") {
      return {
        statusLabel: "Activo",
        statusTone: "positive",
        statusFilterLabel: "Activos",
      };
    }

    if (status === "upcoming") {
      return {
        statusLabel: "Proximo",
        statusTone: "neutral",
        statusFilterLabel: "Proximos",
      };
    }

    return {
      statusLabel: status,
      statusTone: "neutral",
      statusFilterLabel: "Finalizados",
    };
  };

  // Contamos jugadores por campeonato a partir de la tabla intermedia, asi evitamos acoplar la vista a esa relacion.
  const championshipsWithPlayersCount = championships.map((championship) => {
    const playersCount = playerChampionships.filter(
      (item) => item.championshipId === championship.id,
    ).length;
    const statusMeta = getStatusMeta(championship.status);

    return {
      ...championship,
      ...statusMeta,
      categoryName: categories.find((category) => category.id === championship.categoryId)?.name ?? "Sin categoria",
      playersCount,
      venueBadgeLabel: championship.isVariableVenue ? "Sedes mixtas" : "Sede fija",
      cardAccentTone: championship.status === "active" ? (championship.isVariableVenue ? "orange" : "violet") : "blue",
    };
  });

  res.render("championships", {
    championships: championshipsWithPlayersCount,
    championshipFilters: [
      { label: "Todos", isActive: true, tone: "all" },
      { label: "Activos", isActive: false, tone: "positive" },
      { label: "Proximos", isActive: false, tone: "neutral" },
      { label: "Finalizados", isActive: false, tone: "muted" },
    ],
  });
};

export const renderChampionshipCreation = async (req, res) => renderCreationForm(req, res);

export const createChampionshipManagement = async (req, res) => {
  try {
    const clubId = getCurrentClubId(req);
    if (!clubId) {
      throw new Error("Tu usuario no esta asociado a un club.");
    }

    const payload = validateCreatePayload(req.body);
    const category = await getCategoryById(payload.categoryId, { clubId });
    if (!category) {
      throw new Error("La categoria seleccionada no pertenece a tu club.");
    }

    await createChampionship({ ...payload, clubId });
    res.redirect("/campeonatos");
  } catch (error) {
    await renderCreationForm(req, res, { status: 400, values: req.body, error: error.message });
  }
};
