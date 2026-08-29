// Este archivo define las rutas API del modulo de autenticacion.
import { Router } from "express";
import { login, register } from "./auth.api.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
