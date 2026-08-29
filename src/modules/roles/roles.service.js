// Este archivo obtiene roles desde JSON o desde la base de datos segun el flag activo.
import Role from "../../models/role.model.js";
import { initModelAssociations } from "../../models/associations.js";

const shouldUseDatabase = () => process.env.DB_READ_ROLES === "true";

// Este mapeo deja los roles con la forma minima que consume la app.
const mapRole = (role) => ({
  id: role.id,
  name: role.name,
});

export const getRoles = async () => {
  if (!shouldUseDatabase()) {
    // Por ahora no hay respaldo en JSON para roles, asi que sin DB no devolvemos datos.
    return [];
  }

  initModelAssociations();

  // Ordenamos por id para que la salida sea estable.
  const roles = await Role.findAll({
    order: [["id", "ASC"]],
  });

  return roles.map((role) => mapRole(role));
};
