// Este archivo prepara la informacion de campeonatos y su cantidad de jugadores.
import { getPlayerChampionships } from "../player-championships/player-championships.service.js";
import { getCategories } from "../categories/categories.service.js";
import { getChampionships } from "./championships.service.js";

export const renderChampionships = async (req, res) => {
  // Cruzamos campeonatos con categorias y relaciones de jugadores para dejar la vista ya resuelta.
  const championships = await getChampionships();
  const playerChampionships = await getPlayerChampionships();
  const categories = await getCategories();

  const getStatusMeta = (status) => {
    if (status === "active") {
      return {
        statusLabel: "Activo",
        statusTone: "positive",
        statusFilterLabel: "Activos",
      };
    }

    if (status === "upcoming") {
      return {
        statusLabel: "Proximo",
        statusTone: "neutral",
        statusFilterLabel: "Proximos",
      };
    }

    return {
      statusLabel: status,
      statusTone: "neutral",
      statusFilterLabel: "Finalizados",
    };
  };

  // Contamos jugadores por campeonato a partir de la tabla intermedia, asi evitamos acoplar la vista a esa relacion.
  const championshipsWithPlayersCount = championships.map((championship) => {
    const playersCount = playerChampionships.filter(
      (item) => item.championshipId === championship.id,
    ).length;
    const statusMeta = getStatusMeta(championship.status);

    return {
      ...championship,
      ...statusMeta,
      categoryName: categories.find((category) => category.id === championship.categoryId)?.name ?? "Sin categoria",
      playersCount,
      venueBadgeLabel: championship.isVariableVenue ? "Sedes mixtas" : "Sede fija",
      cardAccentTone: championship.status === "active" ? (championship.isVariableVenue ? "orange" : "violet") : "blue",
    };
  });

  res.render("championships", {
    championships: championshipsWithPlayersCount,
    championshipFilters: [
      { label: "Todos", isActive: true, tone: "all" },
      { label: "Activos", isActive: false, tone: "positive" },
      { label: "Proximos", isActive: false, tone: "neutral" },
      { label: "Finalizados", isActive: false, tone: "muted" },
    ],
  });
};
