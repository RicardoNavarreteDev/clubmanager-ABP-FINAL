// Este archivo define la ruta web que renderiza la pagina de jugadores.
import { Router } from "express";
import { requireWebAuth } from "../../middlewares/web-auth.middleware.js";
import { renderPlayers } from "./players.web.controller.js";

const router = Router();

router.get("/", requireWebAuth, renderPlayers);

export default router;
