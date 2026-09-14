// Este archivo prepara la lista de jugadores y la manda a la vista.
import { getPlayers } from "./players.service.js";
import { getCategories } from "../categories/categories.service.js";

const PLAYERS_PER_PAGE = 4;

export const renderPlayers = async (req, res) => {
  // Traemos jugadores y categorias por separado para poder enriquecer la vista sin acoplarla a la fuente de datos.
  const clubId = req.authSession?.user?.clubId ?? null;
  const shouldLoadDemoData = res.locals.shouldShowDemoData;
  const players = clubId ? await getPlayers({ clubId }) : shouldLoadDemoData ? await getPlayers() : [];
  const categories = clubId ? await getCategories({ clubId }) : shouldLoadDemoData ? await getCategories() : [];
  const currentPage = Math.max(Number.parseInt(req.query.page ?? "1", 10) || 1, 1);

  const getPlayerAge = (player, category) => {
    if (!category) {
      return 18;
    }

    const minAge = category.minAge ?? 18;
    const maxAge = category.maxAge ?? minAge + 14;

    return minAge + (player.id % Math.max(maxAge - minAge + 1, 1));
  };

  const getRosterStatusMeta = (rosterStatus) => {
    if (rosterStatus === "active") {
      return {
        rosterStatusLabel: "Activo",
        rosterStatusTone: "positive",
      };
    }

    if (rosterStatus === "invited") {
      return {
        rosterStatusLabel: "Invitado",
        rosterStatusTone: "neutral",
      };
    }

    if (rosterStatus === "inactive") {
      return {
        rosterStatusLabel: "Inactivo",
        rosterStatusTone: "negative",
      };
    }

    return {
      rosterStatusLabel: rosterStatus,
      rosterStatusTone: "neutral",
    };
  };

  // La vista espera el nombre de categoria listo, asi que lo resolvemos aca usando la categoria principal del jugador.
  const playersWithCategory = players.map((player) => {
    const primaryCategory = categories.find((category) => category.id === player.primaryCategoryId);
    const rosterStatusMeta = getRosterStatusMeta(player.rosterStatus ?? "active");

    return {
      ...player,
      displayAvatar: player.avatar || "/images/avatars/profile.svg",
      teamName: player.team || res.locals.currentClub.name,
      categoryName: primaryCategory?.name ?? "Sin categoria",
      age: getPlayerAge(player, primaryCategory),
      ...rosterStatusMeta,
    };
  });

  // Los jugadores ven solo plantel activo. Coach y admin pueden revisar el listado completo.
  const visiblePlayers = res.locals.showManagementLinks
    ? playersWithCategory
    : playersWithCategory.filter((player) => player.rosterStatus === "active");

  const totalPlayers = visiblePlayers.length;
  const totalPages = Math.max(Math.ceil(totalPlayers / PLAYERS_PER_PAGE), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const offset = (safeCurrentPage - 1) * PLAYERS_PER_PAGE;
  const paginatedPlayers = visiblePlayers.slice(offset, offset + PLAYERS_PER_PAGE);

  const paginationPages = Array.from({ length: totalPages }, (_, index) => {
    const pageNumber = index + 1;

    return {
      number: pageNumber,
      href: `/jugadores?page=${pageNumber}`,
      isCurrent: pageNumber === safeCurrentPage,
    };
  });

  res.render("players", {
    pageTitle: "Jugadores",
    players: paginatedPlayers,
    pagination: {
      currentPage: safeCurrentPage,
      totalPages,
      totalPlayers,
      hasPreviousPage: safeCurrentPage > 1,
      hasNextPage: safeCurrentPage < totalPages,
      previousPageHref: `/jugadores?page=${safeCurrentPage - 1}`,
      nextPageHref: `/jugadores?page=${safeCurrentPage + 1}`,
      pages: paginationPages,
    },
  });
};
