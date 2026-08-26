// Este archivo obtiene usuarios desde JSON o desde la base de datos segun el flag activo.
import User from "../models/user.model.js";
import { initModelAssociations } from "../models/associations.js";

const shouldUseDatabase = () => process.env.DB_READ_USERS === "true";

// Este mapeo expone nombres de campos consistentes con el resto de la app y oculta detalles del modelo.
const mapUser = (user) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  avatar: user.avatar,
  bio: user.bio,
  location: user.location,
  birthDate: user.birthDate,
  passwordHash: user.passwordHash,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getUsers = async () => {
  if (!shouldUseDatabase()) {
    // Todavia no existe una fuente JSON para usuarios, asi que fuera de DB devolvemos una lista vacia.
    return [];
  }

  initModelAssociations();

  // Ordenamos por id para mantener resultados predecibles en listados y pruebas manuales.
  const users = await User.findAll({
    order: [["id", "ASC"]],
  });

  return users.map((user) => mapUser(user));
};

export const getUserById = async (id) => {
  if (!shouldUseDatabase()) {
    return null;
  }

  initModelAssociations();

  const user = await User.findByPk(id);
  return user ? mapUser(user) : null;
};

export const getUserByEmail = async (email) => {
  if (!shouldUseDatabase()) {
    return null;
  }

  initModelAssociations();

  const user = await User.findOne({
    where: { email },
  });

  return user ? mapUser(user) : null;
};
