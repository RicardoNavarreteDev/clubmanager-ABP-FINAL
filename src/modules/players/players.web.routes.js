// Este archivo define la ruta web que renderiza la pagina de jugadores.
import { Router } from "express";
import { renderPlayers } from "./players.web.controller.js";

const router = Router();

router.get("/", renderPlayers);

export default router;
