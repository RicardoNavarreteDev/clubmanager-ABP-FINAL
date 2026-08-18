import {
  getPlayers,
  getMatches,
  getTrainings,
  getPosts,
} from "../services/json.service.js";

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

  // Preparamos una bandera para diferenciar anuncios de posts normales en la vista.
  const feed = posts.map((post) => ({
    ...post,
    isAnnouncement: post.type === "announcement",
  }));

  const stats = {
    playersCount: players.length,
    playedMatches,
    wins,
    upcomingEvents,
  };

  res.render("home", {
    stats,
    posts: feed,
  });
};
