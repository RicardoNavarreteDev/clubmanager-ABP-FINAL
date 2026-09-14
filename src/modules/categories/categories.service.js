// Este archivo obtiene categorias desde JSON o desde la base de datos segun el flag activo.
import { Op } from "sequelize";
import Category from "../../models/category.model.js";
import { getCategories as getCategoriesFromJson } from "../../shared/data/json.service.js";

const shouldUseDatabase = () => process.env.DB_READ_CATEGORIES === "true";

const ensureDatabaseEnabled = () => {
  if (!shouldUseDatabase()) {
    throw new Error("La creacion de categorias requiere DB_READ_CATEGORIES=true.");
  }
};

const getClubWhere = ({ clubId, includeLegacy = false } = {}) => {
  if (clubId === undefined || clubId === null) {
    return {};
  }

  return includeLegacy
    ? { [Op.or]: [{ clubId }, { clubId: null }] }
    : { clubId };
};

// Este mapeo deja el mismo shape tanto si la categoria vino de Sequelize como si vino desde JSON.
const mapCategory = (category) => ({
  id: category.id,
  clubId: category.clubId ?? null,
  name: category.name,
  genderScope: category.genderScope,
  minAge: category.minAge,
  maxAge: category.maxAge,
});

export const getCategories = async (options = {}) => {
  if (!shouldUseDatabase()) {
    const categories = await getCategoriesFromJson();
    return options.clubId === undefined || options.clubId === null || options.includeLegacy
      ? categories.map((category) => mapCategory(category))
      : [];
  }

  // Ordenamos por id para que los cruces por categoria sigan siendo previsibles.
  const categories = await Category.findAll({
    where: getClubWhere(options),
    order: [["id", "ASC"]],
  });

  return categories.map((category) => mapCategory(category));
};

export const getCategoryById = async (id, options = {}) => {
  if (!shouldUseDatabase()) {
    const categories = await getCategories(options);
    return categories.find((category) => category.id === id) ?? null;
  }

  const category = await Category.findOne({
    where: { id, ...getClubWhere(options) },
  });

  return category ? mapCategory(category) : null;
};

export const createCategory = async (payload) => {
  ensureDatabaseEnabled();
  const category = await Category.create(payload);
  return mapCategory(category);
};
