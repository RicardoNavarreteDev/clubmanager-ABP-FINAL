// Este archivo define las rutas publicas del inicio y del endpoint de estado.
import { Router } from "express";
import { renderHome } from "../controllers/home.controller.js";
import { logRouteAccess } from "../middlewares/log.middleware.js";

const router = Router();

// Ruta principal que renderiza la vista de inicio.
router.get("/", renderHome);

// En /status primero se ejecuta el middleware de log y despues se responde JSON.
router.get("/status", logRouteAccess, (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor funcionando",
  });
});

export default router;
