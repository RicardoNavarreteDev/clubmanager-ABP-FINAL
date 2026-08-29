// Este archivo define las rutas API del modulo de autenticacion.
import { Router } from "express";
import { login, me, register } from "./auth.api.controller.js";
import { authenticateJwt } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateJwt, me);

export default router;
