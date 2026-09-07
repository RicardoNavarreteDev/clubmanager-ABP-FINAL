// Este archivo define la ruta web de la pagina principal.
import { Router } from "express";
import { requireWebAuth } from "../../middlewares/web-auth.middleware.js";
import { renderHome } from "./home.web.controller.js";

const router = Router();

// El dashboard vive separado de la landing publica.
router.get("/dashboard", requireWebAuth, renderHome);

export default router;
