// Este archivo define las rutas API del modulo de usuarios.
import { Router } from "express";
import { authenticateJwt, authorizeRoles } from "../../middlewares/auth.middleware.js";
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./users.api.controller.js";

const router = Router();

router.get("/", authenticateJwt, authorizeRoles("admin", "coach"), listUsers);
router.get("/:id", authenticateJwt, authorizeRoles("admin", "coach"), getUserById);
router.post("/", authenticateJwt, authorizeRoles("admin", "coach"), createUser);
router.put("/:id", authenticateJwt, authorizeRoles("admin", "coach"), updateUser);
router.delete("/:id", authenticateJwt, authorizeRoles("admin", "coach"), deleteUser);

export default router;
