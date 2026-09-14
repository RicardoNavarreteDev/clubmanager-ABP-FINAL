// Este archivo define las rutas web de login, registro y logout.
import { Router } from "express";
import { redirectAuthenticatedUser } from "../../middlewares/web-auth.middleware.js";
import { handleLogin, handleLogout, handleRegister, renderLogin, renderRegister } from "./auth.web.controller.js";

const router = Router();

router.get("/login", redirectAuthenticatedUser, renderLogin);
router.post("/login", redirectAuthenticatedUser, handleLogin);
router.get("/registro", redirectAuthenticatedUser, renderRegister);
router.post("/registro", redirectAuthenticatedUser, handleRegister);
router.post("/logout", handleLogout);

export default router;
