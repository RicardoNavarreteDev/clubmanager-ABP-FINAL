// Este archivo prepara la lista de jugadores y la manda a la vista.
import { getPlayers } from "../services/players.service.js";
import { getCategories } from "../services/categories.service.js";

export const renderPlayers = async (req, res) => {
  // Traemos jugadores y categorias por separado para poder enriquecer la vista sin acoplarla a la fuente de datos.
  const players = await getPlayers();
  const categories = await getCategories();

  const getPlayerAge = (player, category) => {
    if (!category) {
      return 18;
    }

    const minAge = category.minAge ?? 18;
    const maxAge = category.maxAge ?? minAge + 14;

    return minAge + (player.id % Math.max(maxAge - minAge + 1, 1));
  };

  // La vista espera el nombre de categoria listo, asi que lo resolvemos aca usando la categoria principal del jugador.
  const playersWithCategory = players.map((player) => {
    const primaryCategory = categories.find((category) => category.id === player.primaryCategoryId);

    return {
      ...player,
      categoryName: primaryCategory?.name ?? "Sin categoria",
      age: getPlayerAge(player, primaryCategory),
    };
  });

  res.render("players", { players: playersWithCategory });
};
