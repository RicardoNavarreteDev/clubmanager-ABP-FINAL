// Este archivo obtiene categorias desde JSON o desde la base de datos segun el flag activo.
import Category from "../../models/category.model.js";
import { getCategories as getCategoriesFromJson } from "../../shared/data/json.service.js";

const shouldUseDatabase = () => process.env.DB_READ_CATEGORIES === "true";

// Este mapeo deja el mismo shape tanto si la categoria vino de Sequelize como si vino desde JSON.
const mapCategory = (category) => ({
  id: category.id,
  name: category.name,
  genderScope: category.genderScope,
  minAge: category.minAge,
  maxAge: category.maxAge,
});

export const getCategories = async () => {
  if (!shouldUseDatabase()) {
    return getCategoriesFromJson();
  }

  // Ordenamos por id para que los cruces por categoria sigan siendo previsibles.
  const categories = await Category.findAll({
    order: [["id", "ASC"]],
  });

  return categories.map((category) => mapCategory(category));
};
