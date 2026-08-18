import { getCategories, getPlayers } from "../services/json.service.js";

export const renderPlayers = async (req, res) => {
  const players = await getPlayers();
  const categories = await getCategories();

  const playersWithCategory = players.map((player) => ({
    ...player,
    categoryName: categories.find((category) => category.id === player.primaryCategoryId)?.name ?? "Sin categoria",
  }));

  res.render("players", { players: playersWithCategory });
};
