import {
  getCategories,
  getProfile,
  getPlayerChampionships,
  getChampionships,
} from "../services/json.service.js";

export const renderProfile = async (req, res) => {
  const profile = await getProfile();
  const playerChampionships = await getPlayerChampionships();
  const championships = await getChampionships();
  const categories = await getCategories();

  const profileChampionshipLinks = playerChampionships.filter(
    (item) => item.playerId === profile.playerId
  );

  const profileChampionships = championships.filter((championship) =>
    profileChampionshipLinks.some(
      (link) => link.championshipId === championship.id
    )
  ).map((championship) => ({
    ...championship,
    categoryName: categories.find((category) => category.id === championship.categoryId)?.name ?? "Sin categoria",
  }));

  res.render("profile", {
    profile,
    championships: profileChampionships,
  });
};
