// Este archivo define la ruta que renderiza la pagina de jugadores.
import { Router } from "express";
import { renderPlayers } from "../controllers/players.controller.js";

const router = Router();

router.get("/", renderPlayers);

export default router;
