// Este archivo define la ruta que renderiza la pagina de perfil.
import { Router } from "express";
import { renderProfile } from "../controllers/profile.controller.js";

const router = Router();

router.get("/", renderProfile);

export default router;
