// Este archivo define la ruta web que renderiza la pagina de campeonatos.
import { Router } from "express";
import { renderChampionships } from "./championships.web.controller.js";

const router = Router();

router.get("/", renderChampionships);

export default router;
