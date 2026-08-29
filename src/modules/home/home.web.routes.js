// Este archivo define la ruta web de la pagina principal.
import { Router } from "express";
import { renderHome } from "./home.web.controller.js";

const router = Router();

// Esta ruta renderiza la portada principal del sitio.
router.get("/", renderHome);

export default router;
