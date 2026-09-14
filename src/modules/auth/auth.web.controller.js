// Este archivo renderiza y procesa los formularios web de login, registro y logout.
import { clearAuthCookie, setAuthCookie } from "../../middlewares/web-auth.middleware.js";
import { getInvitationByToken } from "../invitations/invitations.service.js";
import { loginWithCredentials, registerWithInvitation } from "./auth.service.js";
import { validateLoginPayload, validateRegisterPayload } from "./auth.validation.js";

const renderLoginView = (res, overrides = {}) => res.render("login", {
  layout: "public",
  pageTitle: "Iniciar sesion",
  loginForm: {
    email: "",
    ...overrides.loginForm,
  },
  loginError: overrides.loginError ?? "",
});

const renderRegisterView = (res, overrides = {}) => res.render("register", {
  layout: "public",
  pageTitle: "Registro con invitacion",
  registerError: overrides.registerError ?? "",
  invitation: overrides.invitation ?? null,
  invitationToken: overrides.invitationToken ?? "",
  registerForm: {
    name: "",
    birthDate: "",
    position: "",
    number: "",
    bio: "",
    ...overrides.registerForm,
  },
});

export const renderLogin = (req, res) => {
  res.redirect("/?modal=login");
};

export const handleLogin = async (req, res) => {
  try {
    const payload = validateLoginPayload(req.body);
    const session = await loginWithCredentials(payload);
    setAuthCookie(res, session.token);
    res.redirect("/dashboard");
  } catch (error) {
    const message = encodeURIComponent(error.message || "No se pudo iniciar sesion.");
    res.redirect(`/?modal=login&error=${message}`);
  }
};

export const renderRegister = async (req, res) => {
  const invitationToken = String(req.query.token ?? "").trim();

  if (!invitationToken) {
    renderRegisterView(res.status(400), {
      registerError: "Debes entrar al registro con un token de invitacion valido.",
    });
    return;
  }

  try {
    const invitation = await getInvitationByToken(invitationToken);

    if (!invitation) {
      renderRegisterView(res.status(404), {
        invitationToken,
        registerError: "La invitacion no existe o ya no esta disponible.",
      });
      return;
    }

    renderRegisterView(res, {
      invitation,
      invitationToken,
      registerForm: {
        name: invitation.name,
      },
    });
  } catch (error) {
    renderRegisterView(res.status(400), {
      invitationToken,
      registerError: error.message || "No se pudo cargar la invitacion.",
    });
  }
};

export const handleRegister = async (req, res) => {
  const invitationToken = String(req.body.token ?? "").trim();

  try {
    const payload = validateRegisterPayload(req.body);
    const session = await registerWithInvitation(payload);
    setAuthCookie(res, session.token);
    res.redirect("/dashboard");
  } catch (error) {
    let invitation = null;

    try {
      if (invitationToken) {
        invitation = await getInvitationByToken(invitationToken);
      }
    } catch {
      invitation = null;
    }

    renderRegisterView(res.status(400), {
      registerError: error.message || "No se pudo completar el registro.",
      invitation,
      invitationToken,
      registerForm: {
        name: req.body.name ?? "",
        birthDate: req.body.birthDate ?? "",
        position: req.body.position ?? "",
        number: req.body.number ?? "",
        bio: req.body.bio ?? "",
      },
    });
  }
};

export const handleLogout = (req, res) => {
  clearAuthCookie(res);
  res.redirect("/login");
};
