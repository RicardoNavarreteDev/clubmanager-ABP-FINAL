import { getCategories, getChampionships, getMatches, getTrainings } from "../services/json.service.js";

export const renderEvents = async (req, res) => {
  const matches = await getMatches();
  const trainings = await getTrainings();
  const championships = await getChampionships();
  const categories = await getCategories();

  const matchesWithChampionship = matches.map((match) => ({
    ...match,
    championshipName: championships.find((championship) => championship.id === match.championshipId)?.name ?? "Amistoso",
  }));

  const trainingsWithCategory = trainings.map((training) => ({
    ...training,
    categoryName: categories.find((category) => category.id === training.categoryId)?.name ?? "Sin categoria",
  }));

  const playedMatches = matchesWithChampionship.filter((match) => match.status === "finished");
  const pendingMatches = matchesWithChampionship.filter((match) => match.status === "upcoming");

  res.render("events", { playedMatches, pendingMatches, trainings: trainingsWithCategory });
};
