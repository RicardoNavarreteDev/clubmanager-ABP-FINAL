// Este archivo define la ruta web que renderiza la pagina de perfil.
import { Router } from "express";
import { requireWebAuth } from "../../middlewares/web-auth.middleware.js";
import { renderProfile } from "./profile.web.controller.js";

const router = Router();

router.get("/", requireWebAuth, renderProfile);

export default router;
