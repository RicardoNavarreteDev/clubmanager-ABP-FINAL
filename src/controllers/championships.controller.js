import { getCategories, getChampionships, getPlayerChampionships } from "../services/json.service.js";

export const renderChampionships = async (req, res) => {
  const championships = await getChampionships();
  const playerChampionships = await getPlayerChampionships();
  const categories = await getCategories();

  const championshipsWithPlayersCount = championships.map((championship) => {
    const playersCount = playerChampionships.filter(
      (item) => item.championshipId === championship.id
    ).length;

    return {
      ...championship,
      categoryName: categories.find((category) => category.id === championship.categoryId)?.name ?? "Sin categoria",
      playersCount,
    };
  });

  res.render("championships", {
    championships: championshipsWithPlayersCount,
  });
};
