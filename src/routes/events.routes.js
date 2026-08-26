// Este archivo define la ruta que renderiza la pagina de eventos.
import { Router } from "express";
import { renderEvents } from "../controllers/events.controller.js";

const router = Router();

router.get("/", renderEvents);

export default router;
