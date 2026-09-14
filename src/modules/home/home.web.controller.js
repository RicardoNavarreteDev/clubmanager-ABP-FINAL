// Este archivo arma el dashboard, sus estadisticas y el feed social del club.
import { getPlayers } from "../players/players.service.js";
import { getMatches } from "../matches/matches.service.js";
import { getTrainings } from "../trainings/trainings.service.js";
import { getPosts } from "../posts/posts.service.js";
import { listFeed } from "../feed/feed.service.js";

const formatMoment = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value ?? "");
  return date.toLocaleString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

const roleLabels = {
  admin: "Administrador",
  coach: "Entrenador",
  player: "Jugador",
};

const mapPersistentPost = (post) => ({
  ...post,
  isAnnouncement: post.type === "announcement",
  isPhoto: post.type === "photo",
  isPoll: post.type === "poll",
  isEvent: post.type === "event",
  displayDate: formatMoment(post.createdAt),
  authorName: post.author?.displayName ?? "Miembro del club",
  authorAvatar: post.author?.avatar ?? "/images/avatars/profile.svg",
  authorRole: roleLabels[post.author?.role] ?? post.author?.role ?? "Miembro",
  comments: (post.comments ?? []).map((comment) => ({
    ...comment,
    displayDate: formatMoment(comment.createdAt),
    authorName: comment.author?.displayName ?? "Miembro",
    authorAvatar: comment.author?.avatar ?? "/images/avatars/profile.svg",
    replies: (comment.replies ?? []).map((reply) => ({
      ...reply,
      displayDate: formatMoment(reply.createdAt),
      authorName: reply.author?.displayName ?? "Miembro",
      authorAvatar: reply.author?.avatar ?? "/images/avatars/profile.svg",
    })),
  })),
  poll: post.poll
    ? {
        ...post.poll,
        options: post.poll.options.map((option) => ({
          ...option,
          percentage: post.poll.votesCount ? Math.round((option.votesCount / post.poll.votesCount) * 100) : 0,
        })),
      }
    : null,
  eventDate: post.event ? formatMoment(post.event.startAt) : null,
});

const mapDemoPost = (post) => ({
  id: post.id,
  type: post.type === "announcement" ? "announcement" : "text",
  isAnnouncement: post.type === "announcement",
  content: post.content,
  imageUrl: post.id === 1 ? "/images/sports-login.svg" : null,
  displayDate: formatMoment(post.date),
  authorName: post.author,
  authorAvatar: post.avatar,
  authorRole: post.role,
  likesCount: post.likes,
  commentsCount: post.comments,
  comments: [],
});

export const renderHome = async (req, res) => {
  const clubId = req.authSession?.user?.clubId ?? null;
  const usesPersistentClubData = Boolean(clubId);
  const sportsScope = usesPersistentClubData ? { clubId } : undefined;

  const [players, matches, trainings] = usesPersistentClubData
    ? [await getPlayers({ clubId }), await getMatches(sportsScope), []]
    : [await getPlayers(), await getMatches(), await getTrainings()];

  const playedMatches = matches.filter((match) => match.status === "finished");
  const upcomingMatches = matches.filter((match) => match.status === "upcoming");
  const wins = playedMatches.filter((match) => {
    const [clubScore, opponentScore] = String(match.result).split("-").map(Number);
    return Number.isFinite(clubScore) && Number.isFinite(opponentScore) && clubScore > opponentScore;
  }).length;

  let posts;
  if (usesPersistentClubData) {
    const feed = await listFeed(req.authSession.user.id, clubId, { page: 1, limit: 30 });
    posts = feed.posts.map(mapPersistentPost);
  } else {
    posts = (await getPosts()).map(mapDemoPost);
  }

  res.render("home", {
    pageTitle: "Dashboard | ClubManager",
    feedPersistenceEnabled: usesPersistentClubData,
    hasNoActivity: usesPersistentClubData && posts.length === 0 && matches.length === 0,
    posts,
    dashboardStats: [
      { title: "Jugadores", value: players.length, tone: "violet" },
      { title: "Partidos jugados", value: playedMatches.length, tone: "green" },
      { title: "Victorias", value: wins, tone: "orange" },
      { title: "Proximos eventos", value: upcomingMatches.length + trainings.length, tone: "blue" },
    ],
  });
};
