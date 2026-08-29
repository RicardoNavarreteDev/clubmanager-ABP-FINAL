// Este archivo define la ruta web que renderiza la pagina de eventos.
import { Router } from "express";
import { renderEvents } from "./events.web.controller.js";

const router = Router();

router.get("/", renderEvents);

export default router;
