// Este archivo combina partidos, entrenamientos y campeonatos para la vista de eventos.
import { getMatches } from "../matches/matches.service.js";
import { getTrainings } from "../trainings/trainings.service.js";
import { getChampionships } from "../championships/championships.service.js";
import { getCategories } from "../categories/categories.service.js";

const MONTH_LABELS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const WEEKDAY_LABELS = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

const formatCompactDate = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return `${String(date.getDate()).padStart(2, "0")} ${MONTH_LABELS[date.getMonth()]}`;
};

const formatTrainingDateParts = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return {
      dayNumber: "--",
      monthLabel: "---",
      weekdayLabel: "---",
    };
  }

  return {
    dayNumber: String(date.getDate()).padStart(2, "0"),
    monthLabel: MONTH_LABELS[date.getMonth()],
    weekdayLabel: WEEKDAY_LABELS[date.getDay()],
  };
};

const estimateTrainingAttendance = (training) => {
  const baseAttendanceByCategory = {
    1: 16,
    2: 20,
  };

  return (baseAttendanceByCategory[training.categoryId] ?? 15) + (training.id % 3);
};

export const renderEvents = async (req, res) => {
  const clubId = req.authSession?.user?.clubId ?? null;
  const shouldLoadDemoData = res.locals.shouldShowDemoData;
  const shouldLoadData = Boolean(clubId) || shouldLoadDemoData;
  const scope = clubId ? { clubId } : undefined;
  // Juntamos estas colecciones aca porque la vista necesita cruces entre partidos, campeonatos y categorias.
  const matches = shouldLoadData ? await getMatches(scope) : [];
  const trainings = shouldLoadDemoData ? await getTrainings() : [];
  const championships = shouldLoadData ? await getChampionships(scope) : [];
  const categories = shouldLoadData ? await getCategories(scope) : [];

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
    const compactDate = formatCompactDate(match.date);

    return {
      ...match,
      ...outcome,
      championshipName: championships.find((championship) => championship.id === match.championshipId)?.name ?? "Amistoso",
      compactDate,
      isLocal: match.condition === "local",
      conditionLabel: match.condition === "local" ? "Local" : "Visitante",
      homeTeamName: match.condition === "local" ? res.locals.currentClub.name : match.opponent,
      awayTeamName: match.condition === "local" ? match.opponent : res.locals.currentClub.name,
      homeTeamShortLabel: match.condition === "local" ? res.locals.clubInitials : match.opponent.slice(0, 2).toUpperCase(),
      awayTeamShortLabel: match.condition === "local" ? match.opponent.slice(0, 2).toUpperCase() : res.locals.clubInitials,
      opponentShortLabel: match.opponent.slice(0, 2).toUpperCase(),
    };
  });

  // A los entrenamientos les agregamos etiquetas parecidas a las de partido para que ambas tarjetas compartan formato visual.
  const trainingsWithCategory = trainings.map((training) => {
    const dateParts = formatTrainingDateParts(training.date);

    return {
      ...training,
      categoryName: categories.find((category) => category.id === training.categoryId)?.name ?? "Sin categoria",
      resultLabel: "Sesion programada",
      resultTone: "neutral",
      resultSummary: training.trainingType,
      attendanceLabel: `${estimateTrainingAttendance(training)} jugadores`,
      accentTone: training.categoryId === 1 ? "violet" : "orange",
      ...dateParts,
    };
  });

  // Separamos jugados y pendientes para que la plantilla no tenga que filtrar listas por su cuenta.
  const playedMatches = matchesWithChampionship.filter((match) => match.status === "finished");
  const pendingMatches = matchesWithChampionship.filter((match) => match.status === "upcoming");

  res.render("events", {
    pageTitle: "Eventos",
    playedMatches,
    pendingMatches,
    trainings: trainingsWithCategory,
    eventFilters: [
      { label: "Todos", isActive: true },
      { label: "Partidos", isActive: false },
      { label: "Entrenamientos", isActive: false },
    ],
  });
};
