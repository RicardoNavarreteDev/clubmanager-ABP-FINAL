// Este archivo define la ruta web del estado del servidor.
import { Router } from "express";
import { logRouteAccess } from "../../middlewares/log.middleware.js";
import { getStatus } from "./status.web.controller.js";

const router = Router();

// En /status primero registramos el acceso y despues respondemos con el estado actual.
router.get("/status", logRouteAccess, getStatus);

export default router;
