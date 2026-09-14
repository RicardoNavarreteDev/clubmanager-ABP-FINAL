// Este archivo configura Express, las vistas, los estaticos y el montaje de rutas.
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { engine } from "express-handlebars";
import swaggerUi from "swagger-ui-express";
import jwt from "jsonwebtoken";
import path from 'path';
import { fileURLToPath } from 'url';
import homeRouter from "./modules/home/home.web.routes.js";
import statusRouter from "./modules/status/status.web.routes.js";
import playersRouter from "./modules/players/players.web.routes.js";
import eventsRouter from "./modules/events/events.web.routes.js";
import championshipRouter from "./modules/championships/championships.web.routes.js";
import profileRouter from "./modules/profile/profile.web.routes.js";
import authWebRouter from "./modules/auth/auth.web.routes.js";
import authApiRouter from "./modules/auth/auth.api.routes.js";
import invitationsApiRouter from "./modules/invitations/invitations.api.routes.js";
import usersApiRouter from "./modules/users/users.api.routes.js";
import playersApiRouter from "./modules/players/players.api.routes.js";
import invitationsWebRouter from "./modules/invitations/invitations.web.routes.js";
import clubsWebRouter from "./modules/clubs/clubs.web.routes.js";
import categoriesManagementRouter from "./modules/categories/categories.web.routes.js";
import matchesManagementRouter from "./modules/matches/matches.web.routes.js";
import feedApiRouter from "./modules/feed/feed.api.routes.js";
import { getCurrentViewerContext } from "./modules/profile/profile.service.js";
import { getCategories } from "./modules/categories/categories.service.js";
import { getMatches } from "./modules/matches/matches.service.js";
import { getTrainings } from "./modules/trainings/trainings.service.js";
import { apiErrorHandler } from "./middlewares/api-error.middleware.js";
import swaggerSpec from "./config/swagger.js";
import { getAuthenticatedSession } from "./modules/auth/auth.service.js";
import { getAuthTokenFromRequest } from "./middlewares/web-auth.middleware.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const guestViewer = {
  name: "Invitado",
  username: "@guest",
  avatar: "/images/avatars/profile.svg",
  roleLabel: "Invitado",
  roleNames: [],
  isAdmin: false,
  isCoach: false,
  isPlayer: false,
  showManagementLinks: false,
};

const app = express();
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
app.use("/api/", apiLimiter);
app.use(["/api/auth/login", "/api/auth/register"], authLimiter);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Servimos archivos publicos como CSS, imagenes o JS del navegador.
app.use(express.static(path.join(__dirname, '../public'), { dotfiles: "deny", index: false }));
app.set('views', path.join(__dirname, 'views'));

app.use(async (req, res, next) => {
  // La API no necesita widgets globales ni sesión de vistas.
  if (req.path.startsWith("/api")) {
    try {
      const apiToken = getAuthTokenFromRequest(req);
      req.authToken = apiToken;
      req.authSession = null;
    } catch {
      req.authToken = null;
      req.authSession = null;
    }
    next();
    return;
  }

  try {
    const authToken = getAuthTokenFromRequest(req);
    let authSession = null;

    if (authToken) {
      try {
        const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);
        authSession = await getAuthenticatedSession(decodedToken.userId, decodedToken.clubId);
      } catch {
        authSession = null;
      }
    }

    const isDemoMode = process.env.APP_DEMO_MODE !== "false";
    const shouldShowDemoData = Boolean(authSession) && isDemoMode && !authSession.user?.club;
    const clubId = authSession?.user?.clubId ?? null;
    const sportsScope = clubId ? { clubId } : undefined;
    const shouldLoadSportsData = Boolean(clubId) || shouldShowDemoData;
    const [matches, trainings, categories] = await Promise.all([
      shouldLoadSportsData ? getMatches(sportsScope).catch(() => []) : Promise.resolve([]),
      shouldShowDemoData ? getTrainings().catch(() => []) : Promise.resolve([]),
      shouldLoadSportsData ? getCategories(sportsScope).catch(() => []) : Promise.resolve([]),
    ]);
    const currentViewer = authSession
      ? await getCurrentViewerContext(authSession)
      : guestViewer;

    req.authToken = authToken;
    req.authSession = authSession;

    const currentClub = authSession?.user?.club ?? {
      name: "Club Prueba",
      sport: "Gestion deportiva",
      logo: "/images/avatars/club.svg",
    };

    res.locals.isHome = req.path === "/dashboard";
    res.locals.isPlayers = req.path === "/jugadores";
    res.locals.isEvents = req.path === "/eventos";
    res.locals.isProfile = req.path === "/perfil";
    res.locals.isInvitations = req.path.startsWith("/gestion/invitaciones");
    res.locals.isCategories = req.path.startsWith("/gestion/categorias");
    res.locals.isMatchManagement = req.path.startsWith("/gestion/partidos");
    res.locals.upcomingMatches = matches.filter((match) => match.status === "upcoming");
    res.locals.nextUpcomingMatch = res.locals.upcomingMatches[0] ?? null;
    res.locals.upcomingTrainings = trainings.map((training) => ({
      ...training,
      categoryName: categories.find((category) => category.id === training.categoryId)?.name ?? "Sin categoria",
      trainingAccentTone: training.categoryId === 1 ? "violet" : "orange",
      trainingIconLabel: training.categoryId === 1 ? "GR" : "TC",
    }));
    res.locals.isChampionships = req.path === "/campeonatos";
    res.locals.authToken = authToken;
    res.locals.authSession = authSession;
    res.locals.isAuthenticated = Boolean(authSession);
    res.locals.currentViewer = currentViewer;
    res.locals.isAdmin = currentViewer.isAdmin;
    res.locals.isCoach = currentViewer.isCoach;
    res.locals.isPlayer = currentViewer.isPlayer;
    res.locals.showManagementLinks = currentViewer.showManagementLinks;
    res.locals.currentClub = currentClub;
    res.locals.availableClubs = authSession?.user?.clubs ?? [];
    res.locals.clubInitials = currentClub.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    res.locals.isDemoMode = isDemoMode;
    res.locals.shouldShowDemoData = shouldShowDemoData;
    res.locals.canonicalUrl = req.path;
    // Solo la landing es indexable; el resto del layout público es transaccional.
    res.locals.metaRobots = req.path === "/" ? "index,follow" : "noindex,nofollow";
    res.locals.pageDescription = "ClubManager: gestión deportiva simple para clubes, jugadores, eventos y campeonatos.";
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/", authWebRouter);

// La landing y el alta del club son publicas.
app.use("/", clubsWebRouter);

// Montamos la ruta principal en /.
app.use("/", homeRouter);

// Montamos la ruta de estado tambien sobre la raiz para mantener la URL /status.
app.use("/", statusRouter);

// Montamos las rutas de jugadores bajo /jugadores.
app.use("/jugadores", playersRouter);

app.use("/eventos", eventsRouter);

app.use("/campeonatos", championshipRouter);

app.use("/perfil", profileRouter);

app.use("/gestion/invitaciones", invitationsWebRouter);
app.use("/gestion/categorias", categoriesManagementRouter);
app.use("/gestion/partidos", matchesManagementRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Montamos las rutas API de usuarios bajo /api/users para exponer el CRUD en JSON.
app.use("/api/users", usersApiRouter);

// Montamos las rutas API de jugadores bajo /api/players para exponer lectura y actualizaciones del dominio deportivo.
app.use("/api/players", playersApiRouter);

// Montamos las rutas API de invitaciones bajo /api/invitations para preparar el flujo real de ingreso a la app.
app.use("/api/invitations", invitationsApiRouter);

// Montamos las rutas API de autenticacion para registro y login basados en invitacion.
app.use("/api/auth", authApiRouter);
app.use("/api/feed", feedApiRouter);

app.use("/api", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint API no encontrado.",
    data: null,
  });
});

app.use(apiErrorHandler);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  res.set("X-Robots-Tag", "noindex,nofollow");
  res.status(error.statusCode || 500).render("500", {
    layout: "public",
    pageTitle: "Error",
    metaRobots: "noindex,nofollow",
    message: process.env.NODE_ENV === "production"
      ? "Error interno del servidor"
      : error.message || "Error interno del servidor",
  });
});

// Si ninguna ruta coincide, respondemos con la vista 404.
app.use((req, res) => {
  res.set("X-Robots-Tag", "noindex,nofollow");
  res.status(404).render("404", { layout: "public", pageTitle: "Pagina no encontrada", metaRobots: "noindex,nofollow" });
});

export default app;
