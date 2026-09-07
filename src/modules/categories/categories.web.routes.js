// Este archivo define las rutas web de gestion de categorias.
import { Router } from "express";
import { requireManagementAccess } from "../../middlewares/web-auth.middleware.js";
import {
  createCategoryManagement,
  renderCategoriesManagement,
} from "./categories.web.controller.js";

const router = Router();

router.get("/", requireManagementAccess, renderCategoriesManagement);
router.post("/", requireManagementAccess, createCategoryManagement);

export default router;
