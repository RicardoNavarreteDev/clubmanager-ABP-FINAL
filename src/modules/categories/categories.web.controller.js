// Este archivo renderiza y procesa la gestion web de categorias.
import { createCategory, getCategories } from "./categories.service.js";
import { validateCreateCategoryPayload } from "./categories.validation.js";

const getCurrentClubId = (req) => req.authSession?.user?.clubId ?? req.authSession?.user?.club?.id ?? null;

const renderForm = async (req, res, options = {}) => {
  const clubId = getCurrentClubId(req);
  const categories = clubId ? await getCategories({ clubId }) : [];

  res.status(options.status ?? 200).render("categories", {
    pageTitle: "Gestionar categorias",
    isCategoryForm: true,
    categories,
    values: options.values ?? {},
    error: options.error,
    success: req.query.created === "1" ? "Categoria creada correctamente." : null,
  });
};

export const renderCategoriesManagement = async (req, res) => renderForm(req, res);

export const createCategoryManagement = async (req, res) => {
  try {
    const clubId = getCurrentClubId(req);
    if (!clubId) {
      throw new Error("Tu usuario no esta asociado a un club.");
    }

    const payload = validateCreateCategoryPayload(req.body);
    await createCategory({ ...payload, clubId });
    res.redirect("/gestion/categorias?created=1");
  } catch (error) {
    await renderForm(req, res, { status: 400, values: req.body, error: error.message });
  }
};
