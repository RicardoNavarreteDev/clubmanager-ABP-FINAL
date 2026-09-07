// Este archivo valida JWT en las rutas privadas de la API y deja la identidad basica en req.user.
import jwt from "jsonwebtoken";
import { getAuthTokenFromRequest } from "./web-auth.middleware.js";

export const authenticateJwt = (req, res, next) => {
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

  try {
    const token = bearerToken || cookieToken;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
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
