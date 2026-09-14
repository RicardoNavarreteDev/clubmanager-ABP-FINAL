// Este archivo valida JWT en las rutas privadas de la API y deja la identidad basica en req.user.
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { initModelAssociations } from "../models/associations.js";
import { getAuthTokenFromRequest } from "./web-auth.middleware.js";

const isUnsafeMethod = (method) => ["POST", "PUT", "PATCH", "DELETE"].includes(String(method).toUpperCase());

export const authenticateJwt = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  const cookieToken = getAuthTokenFromRequest(req);

  if (!authorizationHeader && !cookieToken) {
    res.status(401).json({
      status: "error",
      message: "Debes enviar un token de autenticacion.",
      data: null,
    });
    return;
  }

  const [scheme, bearerToken] = authorizationHeader?.split(" ") ?? [];

  if (authorizationHeader && (scheme !== "Bearer" || !bearerToken)) {
    res.status(401).json({
      status: "error",
      message: "El header Authorization debe usar el formato Bearer <token>.",
      data: null,
    });
    return;
  }

  // Las operaciones de escritura exigen Bearer para evitar CSRF con cookie sola.
  if (isUnsafeMethod(req.method) && !bearerToken) {
    res.status(401).json({
      status: "error",
      message: "Usa Authorization Bearer para operaciones de escritura.",
      data: null,
    });
    return;
  }

  try {
    const token = bearerToken || cookieToken;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Rehidratamos roles y estado desde DB para no confiar en un JWT viejo.
    initModelAssociations();
    const user = await User.findByPk(decodedToken.userId, { include: [{ association: "memberships", include: [{ association: "role", attributes: ["name"] }] }] });

    if (!user || !user.isActive) {
      res.status(401).json({
        status: "error",
        message: "El token no es valido o ya expiro.",
        data: null,
      });
      return;
    }

    const membership = (user.memberships ?? []).find((entry) => entry.clubId === decodedToken.clubId) ?? user.memberships?.[0];
    if (!membership) {
      throw new Error("El usuario no pertenece a un club.");
    }
    req.user = {
      userId: user.id,
      email: user.email,
      roles: membership.role ? [membership.role.name] : [],
      clubId: membership.clubId,
    };
    next();
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "El token no es valido o ya expiro.",
      data: null,
    });
  }
};

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  const currentRoles = Array.isArray(req.user?.roles) ? req.user.roles : [];
  const isAllowed = allowedRoles.some((role) => currentRoles.includes(role));

  if (!isAllowed) {
    res.status(403).json({
      status: "error",
      message: "No tienes permisos para realizar esta accion.",
      data: null,
    });
    return;
  }

  next();
};
