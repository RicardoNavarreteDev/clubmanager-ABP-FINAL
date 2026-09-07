import fs from "node:fs/promises";
import { setAuthCookie } from "../../middlewares/web-auth.middleware.js";
import { registerFounder } from "../auth/auth.service.js";
import { validateFounderRegisterPayload } from "../auth/auth.validation.js";
import { getCurrentClub } from "./clubs.service.js";

const emptyForm = {
  ownerName: "",
  email: "",
  clubName: "",
  sport: "",
  location: "",
  description: "",
  categoryName: "",
  categoryGenderScope: "mixto",
  categoryMinAge: "",
  categoryMaxAge: "",
};

const renderCreateClubView = (res, overrides = {}) => res.render("create-club", {
  layout: "public",
  pageTitle: "Crear mi club",
  createClubError: overrides.createClubError ?? "",
  hasConfiguredClub: overrides.hasConfiguredClub ?? false,
  createClubForm: {
    ...emptyForm,
    ...overrides.createClubForm,
  },
});

export const renderLanding = async (req, res) => {
  const club = await getCurrentClub();

  res.render("landing", {
    layout: "public",
    pageTitle: "Gestion deportiva simple",
    hasConfiguredClub: Boolean(club),
  });
};

export const renderCreateClub = async (req, res) => {
  const club = await getCurrentClub();
  renderCreateClubView(res, { hasConfiguredClub: Boolean(club) });
};

export const handleCreateClub = async (req, res) => {
  try {
    if (req.clubLogoUploadError) {
      throw req.clubLogoUploadError;
    }

    const payload = validateFounderRegisterPayload(req.body);
    const session = await registerFounder({
      ...payload,
      logo: req.file ? `/uploads/clubs/${req.file.filename}` : null,
    });

    setAuthCookie(res, session.token);
    res.redirect("/dashboard");
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    const club = await getCurrentClub().catch(() => null);
    renderCreateClubView(res.status(error.statusCode || 400), {
      createClubError: error.message || "No se pudo crear el club.",
      hasConfiguredClub: Boolean(club),
      createClubForm: {
        ownerName: req.body.ownerName ?? "",
        email: req.body.email ?? "",
        clubName: req.body.clubName ?? "",
        sport: req.body.sport ?? "",
        location: req.body.location ?? "",
        description: req.body.description ?? "",
        categoryName: req.body.categoryName ?? "",
        categoryGenderScope: req.body.categoryGenderScope ?? "mixto",
        categoryMinAge: req.body.categoryMinAge ?? "",
        categoryMaxAge: req.body.categoryMaxAge ?? "",
      },
    });
  }
};
