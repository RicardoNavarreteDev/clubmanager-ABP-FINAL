// Este archivo renderiza y procesa la gestion web de partidos.
import { getChampionshipById, getChampionships } from "../championships/championships.service.js";
import { createMatch, getMatches } from "./matches.service.js";
import { validateCreateMatchPayload } from "./matches.validation.js";

const getCurrentClubId = (req) => req.authSession?.user?.clubId ?? req.authSession?.user?.club?.id ?? null;

const renderForm = async (req, res, options = {}) => {
  const clubId = getCurrentClubId(req);
  const championships = clubId
    ? await getChampionships({ clubId })
    : [];
  const matches = clubId
    ? await getMatches({ clubId })
    : [];

  res.status(options.status ?? 200).render("categories", {
    pageTitle: "Crear partido",
    isMatchForm: true,
    championships,
    matches,
    values: options.values ?? {},
    error: options.error,
    success: req.query.created === "1" ? "Partido creado correctamente." : null,
  });
};

export const renderMatchCreation = async (req, res) => renderForm(req, res);

export const createMatchManagement = async (req, res) => {
  try {
    const clubId = getCurrentClubId(req);
    if (!clubId) {
      throw new Error("Tu usuario no esta asociado a un club.");
    }

    const payload = validateCreateMatchPayload(req.body);
    if (payload.championshipId) {
      const championship = await getChampionshipById(payload.championshipId, { clubId });
      if (!championship) {
        throw new Error("El campeonato seleccionado no pertenece a tu club.");
      }
    }

    await createMatch({ ...payload, clubId });
    res.redirect("/gestion/partidos/nuevo?created=1");
  } catch (error) {
    await renderForm(req, res, { status: 400, values: req.body, error: error.message });
  }
};
