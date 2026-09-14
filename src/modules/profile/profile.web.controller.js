// Este archivo arma los datos del perfil y sus campeonatos para renderizar la vista.
import { getProfile } from "./profile.service.js";
import { getCategories } from "../categories/categories.service.js";
import { getChampionships } from "../championships/championships.service.js";
import { getPlayerChampionships } from "../player-championships/player-championships.service.js";
import { getPlayers } from "../players/players.service.js";
import { getMatches } from "../matches/matches.service.js";
import { getTrainings } from "../trainings/trainings.service.js";

const formatDisplayDate = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const renderProfile = async (req, res) => {
  // El perfil se arma mezclando el usuario actual con las relaciones que lo conectan a sus campeonatos.
  const profile = await getProfile(req.authSession);
  const clubId = req.authSession?.user?.clubId ?? null;
  const shouldLoadDemoData = res.locals.shouldShowDemoData;
  const shouldLoadClubData = Boolean(clubId);
  const scope = clubId ? { clubId } : undefined;
  const playerChampionships = shouldLoadDemoData ? await getPlayerChampionships() : [];
  const championships = shouldLoadClubData || shouldLoadDemoData ? await getChampionships(scope) : [];
  const categories = shouldLoadClubData || shouldLoadDemoData ? await getCategories(scope) : [];
  const players = shouldLoadClubData ? await getPlayers({ clubId }) : shouldLoadDemoData ? await getPlayers() : [];
  const matches = shouldLoadClubData || shouldLoadDemoData ? await getMatches(scope) : [];
  const trainings = shouldLoadDemoData ? await getTrainings() : [];

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

  const normalizedRole = String(profile.role).toLowerCase();
  const isManagementProfile = normalizedRole.includes("admin")
    || normalizedRole.includes("coach")
    || normalizedRole.includes("entrenador")
    || normalizedRole.includes("entrenadora");

  // Primero filtramos solo los enlaces del jugador del perfil para no recorrer campeonatos sin necesidad.
  const profileChampionshipLinks = profile.playerId
    ? playerChampionships.filter((item) => item.playerId === profile.playerId)
    : [];

  // Despues resolvemos los campeonatos completos y les agregamos etiquetas listas para pintar en la vista.
  const visibleChampionships = championships.filter((championship) =>
    profileChampionshipLinks.some(
      (link) => link.championshipId === championship.id,
    ),
  );

  const profileChampionships = visibleChampionships.map((championship) => ({
    ...championship,
    ...getStatusMeta(championship.status),
    categoryName: categories.find((category) => category.id === championship.categoryId)?.name ?? "Sin categoria",
    playersCount: playerChampionships.filter((item) => item.championshipId === championship.id).length,
    venueBadgeLabel: championship.isVariableVenue ? "Sedes mixtas" : "Sede fija",
    cardAccentTone: championship.status === "active" ? (championship.isVariableVenue ? "orange" : "violet") : "blue",
  }));

  const upcomingMatch = matches.find((match) => match.status === "upcoming") ?? null;
  const finishedMatches = matches.filter((match) => match.status === "finished");
  const wins = finishedMatches.filter((match) => {
    const [teamScore, opponentScore] = String(match.result).split("-").map(Number);
    return teamScore > opponentScore;
  }).length;

  const profileHighlights = isManagementProfile
    ? [
      {
        label: "Jugadores activos",
        value: `${players.length}`,
        helper: "Plantel del club",
      },
      {
        label: "Campeonatos activos",
        value: `${championships.filter((championship) => championship.status === "active").length}`,
        helper: "Torneos en curso",
      },
      {
        label: "Eventos planificados",
        value: `${matches.filter((match) => match.status === "upcoming").length + trainings.length}`,
        helper: "Agenda del mes",
      },
      {
        label: "Enfoque actual",
        value: "Gestion deportiva",
        helper: "Coordinar equipo y torneos",
      },
    ]
    : [
      {
        label: "Categoria",
        value: profile.category,
        helper: "Division actual",
      },
      {
        label: "Campeonatos",
        value: `${profileChampionships.length}`,
        helper: "Torneos inscritos",
      },
      {
        label: "Proximo reto",
        value: upcomingMatch ? upcomingMatch.opponent : "Sin partido",
        helper: upcomingMatch ? `${upcomingMatch.date} · ${upcomingMatch.time}` : "Agenda pendiente",
      },
      {
        label: "Rendimiento club",
        value: `${wins}/${finishedMatches.length || 0}`,
        helper: "Victorias del ciclo",
      },
    ];

  const profileFocusSection = isManagementProfile
    ? {
      title: "Gestion y liderazgo",
      description: "Un resumen rapido de la operacion deportiva y la coordinacion del club.",
      cards: [
        {
          title: "Planificacion semanal",
          body: `${trainings.length} entrenamientos y ${matches.filter((match) => match.status === "upcoming").length} partidos programados actualmente.`,
        },
        {
          title: "Competencias activas",
          body: `${championships.filter((championship) => championship.status === "active").length} campeonatos activos con seguimiento del plantel y sus sedes.`,
        },
        {
          title: "Comunidad del club",
          body: `${players.length} jugadores visibles en la plataforma para coordinar convocatoria, informacion y acompanamiento.`,
        },
      ],
    }
    : {
      title: "Enfoque del jugador",
      description: "Un resumen del contexto competitivo y del momento actual dentro del plantel.",
      cards: [
        {
          title: "Momento competitivo",
          body: upcomingMatch ? `El proximo desafio es ante ${upcomingMatch.opponent} en ${upcomingMatch.location}.` : "No hay un partido proximo cargado en la agenda.",
        },
        {
          title: "Participacion en torneos",
          body: profileChampionships.length ? `Actualmente figura en ${profileChampionships.length} campeonato${profileChampionships.length === 1 ? "" : "s"} del club.` : "Todavia no figura inscrito en campeonatos visibles.",
        },
        {
          title: "Identidad de equipo",
          body: `Perfil enfocado en ${profile.team}, con categoria ${profile.category} y participacion activa en la dinamica del plantel.`,
        },
      ],
    };

  res.render("profile", {
    pageTitle: "Perfil",
    profile: {
      ...profile,
      birthDateRaw: profile.birthDate,
      birthDate: formatDisplayDate(profile.birthDate),
      roleBadge: normalizedRole.includes("admin") ? "Administrador" : normalizedRole.includes("coach") ? "Coach" : "Jugador",
      isManagementProfile,
    },
    championships: profileChampionships,
    profileHighlights,
    profileFocusSection,
  });
};
