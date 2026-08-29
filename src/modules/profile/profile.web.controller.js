// Este archivo arma los datos del perfil y sus campeonatos para renderizar la vista.
import { getProfile } from "./profile.service.js";
import { getCategories } from "../categories/categories.service.js";
import { getChampionships } from "../championships/championships.service.js";
import { getPlayerChampionships } from "../player-championships/player-championships.service.js";

export const renderProfile = async (req, res) => {
  // El perfil se arma mezclando el usuario actual con las relaciones que lo conectan a sus campeonatos.
  const profile = await getProfile();
  const playerChampionships = await getPlayerChampionships();
  const championships = await getChampionships();
  const categories = await getCategories();

  const getStatusMeta = (status) => {
    if (status === "active") {
      return {
        statusLabel: "Activo",
        statusTone: "positive",
      };
    }

    if (status === "upcoming") {
      return {
        statusLabel: "Proximo",
        statusTone: "neutral",
      };
    }

    return {
      statusLabel: status,
      statusTone: "neutral",
    };
  };

  // Primero filtramos solo los enlaces del jugador del perfil para no recorrer campeonatos sin necesidad.
  const profileChampionshipLinks = playerChampionships.filter(
    (item) => item.playerId === profile.playerId,
  );

  // Despues resolvemos los campeonatos completos y les agregamos etiquetas listas para pintar en la vista.
  const profileChampionships = championships.filter((championship) =>
    profileChampionshipLinks.some(
      (link) => link.championshipId === championship.id,
    ),
  ).map((championship) => ({
    ...championship,
    ...getStatusMeta(championship.status),
    categoryName: categories.find((category) => category.id === championship.categoryId)?.name ?? "Sin categoria",
  }));

  res.render("profile", {
    profile,
    championships: profileChampionships,
  });
};
