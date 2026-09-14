// Este archivo define las rutas web de gestion de partidos.
import { Router } from "express";
import { requireManagementAccess } from "../../middlewares/web-auth.middleware.js";
import { createMatchManagement, renderMatchCreation } from "./matches.web.controller.js";

const router = Router();

router.get("/nuevo", requireManagementAccess, renderMatchCreation);
router.post("/", requireManagementAccess, createMatchManagement);

export default router;
