// Este archivo configura Express, las vistas, los estaticos y el montaje de rutas.
import express from "express";
import morgan from "morgan";
import { engine } from "express-handlebars";
import path from 'path';
import { fileURLToPath } from 'url';
import homeRouter from "./routes/home.routes.js";
import playersRouter from "./routes/players.routes.js";
import eventsRouter from "./routes/events.routes.js";
import championshipRouter from "./routes/championships.routes.js";
import profileRouter from "./routes/profile.routes.js";
import { getCategories, getMatches, getTrainings } from "./services/json.service.js";


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

    res.locals.isHome = req.path === "/";
    res.locals.isPlayers = req.path === "/jugadores";
    res.locals.isEvents = req.path === "/eventos";
    res.locals.isProfile = req.path === "/perfil";
    res.locals.upcomingMatches = matches.filter((match) => match.status === "upcoming");
    res.locals.upcomingTrainings = trainings.map((training) => ({
      ...training,
      categoryName: categories.find((category) => category.id === training.categoryId)?.name ?? "Sin categoria",
    }));
    res.locals.isChampionships = req.path === "/campeonatos";
    next();
  } catch (error) {
    next(error);
  }
});

// Montamos la ruta principal en /.
app.use("/", homeRouter);

// Montamos las rutas de jugadores bajo /jugadores.
app.use("/jugadores", playersRouter);

app.use("/eventos", eventsRouter);

app.use("/campeonatos", championshipRouter);

app.use("/perfil", profileRouter);


// Si ninguna ruta coincide, respondemos con la vista 404.
app.use((req, res) => {
  res.status(404).render("404");
});

export default app;
