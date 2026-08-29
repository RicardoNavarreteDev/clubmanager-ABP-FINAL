// Este archivo define la ruta web que renderiza la pagina de perfil.
import { Router } from "express";
import { renderProfile } from "./profile.web.controller.js";

const router = Router();

router.get("/", renderProfile);

export default router;
