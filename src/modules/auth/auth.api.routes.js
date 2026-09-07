// Este archivo define las rutas API del modulo de autenticacion.
import { Router } from "express";
import { login, me, register, updateMyEmail, updateMyPassword, updateMyProfile, uploadMyAvatar } from "./auth.api.controller.js";
import { authenticateJwt } from "../../middlewares/auth.middleware.js";
import { uploadAvatar } from "../../middlewares/avatar-upload.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateJwt, me);
router.post("/me/avatar", authenticateJwt, uploadAvatar, uploadMyAvatar);
router.put("/me/profile", authenticateJwt, updateMyProfile);
router.put("/me/email", authenticateJwt, updateMyEmail);
router.put("/me/password", authenticateJwt, updateMyPassword);

export default router;
