// Este archivo combina partidos, entrenamientos y campeonatos para la vista de eventos.
import { getMatches } from "../services/matches.service.js";
import { getTrainings } from "../services/trainings.service.js";
import { getChampionships } from "../services/championships.service.js";
import { getCategories } from "../services/categories.service.js";

export const renderEvents = async (req, res) => {
  // Juntamos estas colecciones aca porque la vista necesita cruces entre partidos, campeonatos y categorias.
  const matches = await getMatches();
  const trainings = await getTrainings();
  const championships = await getChampionships();
  const categories = await getCategories();

  const getMatchOutcome = (result) => {
    // Si el resultado no viene en formato numerico, devolvemos el texto tal cual para no romper la UI.
    const [clubScoreRaw, opponentScoreRaw] = String(result).split("-");
    const clubScore = Number.parseInt(clubScoreRaw, 10);
    const opponentScore = Number.parseInt(opponentScoreRaw, 10);

    if (Number.isNaN(clubScore) || Number.isNaN(opponentScore)) {
      return {
        resultLabel: result,
        resultTone: "neutral",
        resultSummary: result,
      };
    }

    if (clubScore > opponentScore) {
      return {
        resultLabel: "Victoria",
        resultTone: "positive",
        resultSummary: `${clubScore} - ${opponentScore}`,
      };
    }

    if (clubScore < opponentScore) {
      return {
        resultLabel: "Derrota",
        resultTone: "negative",
        resultSummary: `${clubScore} - ${opponentScore}`,
      };
    }

    return {
      resultLabel: "Empate",
      resultTone: "neutral",
      resultSummary: `${clubScore} - ${opponentScore}`,
    };
  };

  // Convertimos cada partido en un objeto mas amigable para la vista, incluyendo el nombre del campeonato.
  const matchesWithChampionship = matches.map((match) => {
    const outcome = getMatchOutcome(match.result);

    return {
      ...match,
      ...outcome,
      championshipName: championships.find((championship) => championship.id === match.championshipId)?.name ?? "Amistoso",
    };
  });

  // A los entrenamientos les agregamos etiquetas parecidas a las de partido para que ambas tarjetas compartan formato visual.
  const trainingsWithCategory = trainings.map((training) => ({
    ...training,
    categoryName: categories.find((category) => category.id === training.categoryId)?.name ?? "Sin categoria",
    resultLabel: "Sesion programada",
    resultTone: "neutral",
    resultSummary: training.trainingType,
  }));

  // Separamos jugados y pendientes para que la plantilla no tenga que filtrar listas por su cuenta.
  const playedMatches = matchesWithChampionship.filter((match) => match.status === "finished");
  const pendingMatches = matchesWithChampionship.filter((match) => match.status === "upcoming");

  res.render("events", { playedMatches, pendingMatches, trainings: trainingsWithCategory });
};
