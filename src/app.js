// Este archivo configura Express, las vistas, los estaticos y el montaje de rutas.
import express from "express";
import morgan from "morgan";
import { engine } from "express-handlebars";
import path from 'path';
import { fileURLToPath } from 'url';
import homeRouter from "./modules/home/home.web.routes.js";
import statusRouter from "./modules/status/status.web.routes.js";
import playersRouter from "./modules/players/players.web.routes.js";
import eventsRouter from "./modules/events/events.web.routes.js";
import championshipRouter from "./modules/championships/championships.web.routes.js";
import profileRouter from "./modules/profile/profile.web.routes.js";
import authApiRouter from "./modules/auth/auth.api.routes.js";
import invitationsApiRouter from "./modules/invitations/invitations.api.routes.js";
import usersApiRouter from "./modules/users/users.api.routes.js";
import playersApiRouter from "./modules/players/players.api.routes.js";
import { getCurrentViewerContext } from "./modules/profile/profile.service.js";
import { getCategories } from "./modules/categories/categories.service.js";
import { getMatches } from "./modules/matches/matches.service.js";
import { getTrainings } from "./modules/trainings/trainings.service.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Servimos archivos publicos como CSS, imagenes o JS del navegador.
app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, 'views'));

app.use(async (req, res, next) => {
  try {
    const matches = await getMatches();
    const trainings = await getTrainings();
    const categories = await getCategories();
    const currentViewer = await getCurrentViewerContext();

    res.locals.isHome = req.path === "/";
    res.locals.isPlayers = req.path === "/jugadores";
    res.locals.isEvents = req.path === "/eventos";
    res.locals.isProfile = req.path === "/perfil";
    res.locals.upcomingMatches = matches.filter((match) => match.status === "upcoming");
    res.locals.nextUpcomingMatch = res.locals.upcomingMatches[0] ?? null;
    res.locals.upcomingTrainings = trainings.map((training) => ({
      ...training,
      categoryName: categories.find((category) => category.id === training.categoryId)?.name ?? "Sin categoria",
      trainingAccentTone: training.categoryId === 1 ? "violet" : "orange",
      trainingIconLabel: training.categoryId === 1 ? "GR" : "TC",
    }));
    res.locals.isChampionships = req.path === "/campeonatos";
    res.locals.currentViewer = currentViewer;
    res.locals.isAdmin = currentViewer.isAdmin;
    res.locals.isCoach = currentViewer.isCoach;
    res.locals.isPlayer = currentViewer.isPlayer;
    res.locals.showManagementLinks = currentViewer.showManagementLinks;
    next();
  } catch (error) {
    next(error);
  }
});

// Montamos la ruta principal en /.
app.use("/", homeRouter);

// Montamos la ruta de estado tambien sobre la raiz para mantener la URL /status.
app.use("/", statusRouter);

// Montamos las rutas de jugadores bajo /jugadores.
app.use("/jugadores", playersRouter);

app.use("/eventos", eventsRouter);

app.use("/campeonatos", championshipRouter);

app.use("/perfil", profileRouter);

// Montamos las rutas API de usuarios bajo /api/users para exponer el CRUD en JSON.
app.use("/api/users", usersApiRouter);

// Montamos las rutas API de jugadores bajo /api/players para exponer lectura y actualizaciones del dominio deportivo.
app.use("/api/players", playersApiRouter);

// Montamos las rutas API de invitaciones bajo /api/invitations para preparar el flujo real de ingreso a la app.
app.use("/api/invitations", invitationsApiRouter);

// Montamos las rutas API de autenticacion para registro y login basados en invitacion.
app.use("/api/auth", authApiRouter);


// Si ninguna ruta coincide, respondemos con la vista 404.
app.use((req, res) => {
  res.status(404).render("404");
});

export default app;
