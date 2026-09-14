import fs from "node:fs/promises";
import { setAuthCookie } from "../../middlewares/web-auth.middleware.js";
import { getAuthenticatedSession, registerFounder } from "../auth/auth.service.js";
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
  const whatsappNumber = (process.env.WHATSAPP_NUMBER || "").replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent("Hola, quiero conocer más sobre ClubManager.");

  res.render("landing", {
    layout: "public",
    pageTitle: "Gestion deportiva simple",
    hasConfiguredClub: Boolean(club),
    whatsappUrl: `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`,
    landingModal: ["login", "create-club"].includes(req.query.modal) ? req.query.modal : "",
    landingError: String(req.query.error ?? "").trim(),
  });
};

export const renderCreateClub = async (req, res) => {
  res.redirect("/?modal=create-club");
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
    }, req.authSession?.user?.id ?? null);

    setAuthCookie(res, session.token);
    res.redirect("/dashboard");
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    const message = encodeURIComponent(error.message || "No se pudo crear el club.");
    res.redirect(`/?modal=create-club&error=${message}`);
  }
};

export const activateClub = async (req, res) => {
  try {
    const session = await getAuthenticatedSession(req.authSession.user.id, Number(req.params.clubId));
    setAuthCookie(res, session.token);
    res.redirect("/dashboard");
  } catch {
    res.redirect("/dashboard");
  }
};
