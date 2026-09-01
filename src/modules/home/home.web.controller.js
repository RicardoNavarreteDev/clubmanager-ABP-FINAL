// Este archivo arma los datos del home y renderiza la vista principal.
import { getPlayers } from "../players/players.service.js";
import { getMatches } from "../matches/matches.service.js";
import { getTrainings } from "../trainings/trainings.service.js";
import { getPosts } from "../posts/posts.service.js";

const formatCompactDate = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
  });
};

export const renderHome = async (req, res) => {
  // Cargamos todas las fuentes de datos que necesita la pagina de inicio.
  const players = await getPlayers();
  const matches = await getMatches();
  const trainings = await getTrainings();
  const posts = await getPosts();

  // Calculamos estadisticas simples para mostrarlas en el resumen del home.
  const playedMatches = matches.filter(
    (match) => match.status === "finished",
  ).length;
  const pendingMatches = matches.filter(
    (match) => match.status === "upcoming",
  ).length;
  const upcomingEvents = pendingMatches + trainings.length;

  // Tomamos el marcador como "Club Prueba - Rival" para contar victorias.
  const wins = matches
    .filter((match) => match.status === "finished")
    .filter((match) => {
      const [teamScore, opponentScore] = match.result.split("-").map(Number);
      return teamScore > opponentScore;
    }).length;
  const effectivenessRate = playedMatches ? Math.round((wins / playedMatches) * 100) : 0;

  // Estos hilos son contenido de apoyo del feed. Quedan en el controller porque hoy no vienen desde una fuente persistente.
  const commentThreads = {
    1: [
      {
        id: 101,
        author: "Matias Rojas",
        role: "Capitan",
        avatar: "/images/avatars/player-1.svg",
        date: "Hoy, 18:12",
        content: "Se noto mucho la mejora en la ayuda defensiva. Buen trabajo del grupo.",
        likes: 6,
        replies: [
          {
            id: 1011,
            author: "Camila Torres",
            role: "Entrenadora",
            avatar: "/images/avatars/coach-1.svg",
            date: "Hoy, 18:30",
            content: "Exacto. Mantengamos esa intensidad para el viernes.",
            likes: 3,
          },
          {
            id: 1012,
            author: "Valentina Munoz",
            role: "Preparadora fisica",
            avatar: "/images/avatars/staff-1.svg",
            date: "Hoy, 18:44",
            content: "La energia del grupo acompano super bien ese tramo final.",
            likes: 2,
          },
          {
            id: 1013,
            author: "Vicente Salazar",
            role: "Jugador",
            avatar: "/images/avatars/player-2.svg",
            date: "Hoy, 18:51",
            content: "Si repetimos eso en partido vamos a competir mucho mejor.",
            likes: 1,
          },
        ],
      },
      {
        id: 102,
        author: "Vicente Salazar",
        role: "Jugador",
        avatar: "/images/avatars/player-2.svg",
        date: "Hoy, 18:40",
        content: "La rotacion desde el lado debil salio mucho mejor que la semana pasada.",
        likes: 4,
        replies: [],
      },
      {
        id: 103,
        author: "Cristobal Herrera",
        role: "Jugador",
        avatar: "/images/avatars/player-7.svg",
        date: "Hoy, 19:02",
        content: "Me gusto mucho como cerramos el ultimo bloque. Hay que sostener ese nivel.",
        likes: 2,
        replies: [],
      },
      {
        id: 104,
        author: "Sebastian Carrasco",
        role: "Jugador",
        avatar: "/images/avatars/player-12.svg",
        date: "Hoy, 19:18",
        content: "La comunicacion desde la banca tambien ayudo bastante.",
        likes: 3,
        replies: [],
      },
      {
        id: 105,
        author: "Diego Contreras",
        role: "Jugador",
        avatar: "/images/avatars/player-6.svg",
        date: "Hoy, 19:26",
        content: "Quedo clarisimo cuando saltar a la ayuda. Eso nos ordeno mucho.",
        likes: 2,
        replies: [],
      },
      {
        id: 106,
        author: "Felipe Bustos",
        role: "Jugador",
        avatar: "/images/avatars/player-10.svg",
        date: "Hoy, 19:31",
        content: "Ojala mantengamos esa concentracion durante todo el partido.",
        likes: 1,
        replies: [],
      },
    ],
    3: [
      {
        id: 301,
        author: "Sebastian Carrasco",
        role: "Jugador",
        avatar: "/images/avatars/player-12.svg",
        date: "Ayer, 21:05",
        content: "Vamos equipo, el grupo esta cada vez mas solido.",
        likes: 5,
        replies: [],
      },
      {
        id: 302,
        author: "Valentina Munoz",
        role: "Preparadora fisica",
        avatar: "/images/avatars/staff-1.svg",
        date: "Ayer, 21:18",
        content: "Se noto mucho la energia en la segunda mitad del entrenamiento.",
        likes: 2,
        replies: [
          {
            id: 3021,
            author: "Matias Rojas",
            role: "Capitan",
            avatar: "/images/avatars/player-1.svg",
            date: "Ayer, 21:26",
            content: "La entrada en calor tambien ayudo bastante.",
            likes: 1,
          },
        ],
      },
    ],
    4: [
      {
        id: 401,
        author: "Camila Torres",
        role: "Entrenadora",
        avatar: "/images/avatars/coach-1.svg",
        date: "Hace 2 horas",
        content: "Muy buena asistencia. Se agradece la puntualidad del grupo.",
        likes: 3,
        replies: [],
      },
    ],
    6: [
      {
        id: 601,
        author: "Diego Contreras",
        role: "Jugador",
        avatar: "/images/avatars/player-6.svg",
        date: "Hace 1 hora",
        content: "Se viene un partido duro, pero el equipo esta preparado.",
        likes: 4,
        replies: [],
      },
    ],
  };

  // Preparamos una bandera para diferenciar anuncios de posts normales en la vista.
  const feed = posts.map((post) => {
    const thread = commentThreads[post.id] ?? [];
    const displayMoments = {
      1: "Hace 2 horas",
      2: "Ayer a las 18:30",
      3: "Hace 4 horas",
      4: "Hace 45 min",
      5: "Ayer a las 09:15",
      6: "Hace 1 hora",
    };
    const roleToneMap = {
      Administracion: "admin",
      Coordinacion: "admin",
      Entrenadora: "coach",
      Capitan: "leader",
      Jugador: "player",
      "Preparadora fisica": "staff",
    };

    return {
      ...post,
      isAnnouncement: post.type === "announcement",
      displayTypeLabel: post.type === "announcement" ? "Anuncio" : "Publicacion",
      displayDate: displayMoments[post.id] ?? formatCompactDate(post.date),
      roleTone: roleToneMap[post.role] ?? "neutral",
      // Dejamos tanto el hilo completo como una vista previa para que la plantilla no tenga que decidir cual usar.
      commentThread: thread,
      commentPreview: thread.length ? thread[thread.length - 1] : null,
    };
  });

  const dashboardStats = [
    {
      title: "Total de jugadores",
      value: players.length,
      note: "+2 este mes",
      tone: "violet",
      isPlayersIcon: true,
    },
    {
      title: "Partidos jugados",
      value: playedMatches,
      note: "+1 esta semana",
      tone: "green",
      isCalendarIcon: true,
    },
    {
      title: "Victorias",
      value: wins,
      note: `${effectivenessRate}% de efectividad`,
      tone: "orange",
      isTrophyIcon: true,
    },
    {
      title: "Proximos eventos",
      value: upcomingEvents,
      note: "En los proximos 30 dias",
      tone: "blue",
      isScheduleIcon: true,
    },
  ];

  res.render("home", {
    dashboardStats,
    posts: feed.map((post) => ({
      ...post,
      commentPreviewList: post.commentThread.slice(0, 2),
      remainingCommentsCount: Math.max(post.comments - 2, 0),
    })),
    homeSeasonOptions: ["Temporada 2026", "Temporada 2025", "Temporada 2024"],
  });
};
