// Este archivo define la ruta web que renderiza la pagina de eventos.
import { Router } from "express";
import { requireWebAuth } from "../../middlewares/web-auth.middleware.js";
import { renderEvents } from "./events.web.controller.js";

const router = Router();

router.get("/", requireWebAuth, renderEvents);

export default router;
