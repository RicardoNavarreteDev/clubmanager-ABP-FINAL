// Este archivo define la ruta web que renderiza la pagina de campeonatos.
import { Router } from "express";
import { requireManagementAccess, requireWebAuth } from "../../middlewares/web-auth.middleware.js";
import {
  createChampionshipManagement,
  renderChampionshipCreation,
  renderChampionships,
} from "./championships.web.controller.js";

const router = Router();

router.get("/", requireWebAuth, renderChampionships);
router.get("/nuevo", requireManagementAccess, renderChampionshipCreation);
router.post("/", requireManagementAccess, createChampionshipManagement);

export default router;
