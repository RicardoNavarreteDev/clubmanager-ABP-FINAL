// Este archivo define la ruta que renderiza la pagina de campeonatos.
import { Router } from "express";
import { renderChampionships } from "../controllers/championships.controller.js";

const router = Router();

router.get("/", renderChampionships);

export default router;
