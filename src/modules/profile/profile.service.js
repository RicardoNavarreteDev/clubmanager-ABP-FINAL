// Este archivo arma el perfil visible usando JSON o la base de datos segun la configuracion.
import User from "../../models/user.model.js";
import { initModelAssociations } from "../../models/associations.js";
import { getProfile as getProfileFromJson } from "../../shared/data/json.service.js";

const shouldUseDatabase = () => process.env.DB_READ_PROFILE === "true";
const getCurrentProfileUserId = () => Number(process.env.DB_PROFILE_USER_ID ?? 3);

const mapRoleLabel = (roles) => {
  const roleLabels = roles
    .map((role) => {
      if (role.name === "admin") {
        return "Admin";
      }

      if (role.name === "coach") {
        return "Coach";
      }

      if (role.name === "player") {
        return "Jugador";
      }

      return role.name;
    })
    .filter(Boolean);

  return roleLabels.join(" · ");
};

const mapProfileFromAuthenticatedSession = (session) => ({
  playerId: session.player?.id ?? null,
  name: session.user.displayName,
  username: `@${session.user.email.split("@")[0]}`,
  email: session.user.email,
  role: mapRoleLabel(session.user.roles ?? []),
  category: session.player?.primaryCategory?.name ?? "Sin categoria",
  team: session.player?.team ?? session.user.club?.name ?? "Club Prueba",
  bio: session.user.bio ?? session.player?.bio ?? "",
  location: session.user.location ?? session.player?.location ?? "",
  birthDate: session.user.birthDate ?? session.player?.birthDate ?? null,
  avatar: session.user.avatar ?? session.player?.avatar ?? "/images/avatars/profile.svg",
});

const inferRoleNamesFromLabel = (roleLabel = "") => {
  const normalizedLabel = String(roleLabel).toLowerCase();

  if (normalizedLabel.includes("admin")) {
    return ["admin"];
  }

  if (normalizedLabel.includes("coach") || normalizedLabel.includes("entrenadora") || normalizedLabel.includes("entrenador")) {
    return ["coach"];
  }

  return ["player"];
};

export const getProfile = async (authenticatedSession = null) => {
  if (authenticatedSession) {
    return mapProfileFromAuthenticatedSession(authenticatedSession);
  }

  if (!shouldUseDatabase()) {
    return getProfileFromJson();
  }

  // Estas asociaciones se piden solo cuando la consulta necesita includes.
  initModelAssociations();

  // Guardamos un fallback porque el perfil puede seguir funcionando aunque el usuario aun no exista en DB.
  const fallbackProfile = await getProfileFromJson();
  const user = await User.findByPk(getCurrentProfileUserId(), {
    include: [
      { association: "roles" },
      {
        association: "player",
        include: [{ association: "primaryCategory" }],
      },
    ],
  });

  if (!user) {
    return fallbackProfile;
  }

  const player = user.player;

  // Mezclamos datos de usuario, jugador y fallback para sostener el contrato actual de la vista.
  return {
    playerId: player?.id ?? fallbackProfile.playerId ?? null,
    name: user.displayName ?? player?.name ?? fallbackProfile.name,
    username: fallbackProfile.username ?? `@${user.email.split("@")[0]}`,
    email: user.email,
    role: mapRoleLabel(user.roles ?? []),
    category: player?.primaryCategory?.name ?? fallbackProfile.category ?? "Sin categoria",
    team: player?.team ?? fallbackProfile.team ?? "Club Prueba",
    bio: user.bio ?? player?.bio ?? fallbackProfile.bio ?? "",
    location: user.location ?? player?.location ?? fallbackProfile.location ?? "",
    birthDate: user.birthDate ?? player?.birthDate ?? fallbackProfile.birthDate ?? null,
    avatar: user.avatar ?? player?.avatar ?? fallbackProfile.avatar,
  };
};

export const getCurrentViewerContext = async (authenticatedSession = null) => {
  if (authenticatedSession) {
    const profile = mapProfileFromAuthenticatedSession(authenticatedSession);
    const roleNames = (authenticatedSession.user.roles ?? []).map((role) => role.name);

    return {
      name: profile.name,
      username: profile.username,
      avatar: profile.avatar,
      roleLabel: profile.role,
      roleNames,
      isAdmin: roleNames.includes("admin"),
      isCoach: roleNames.includes("coach"),
      isPlayer: roleNames.includes("player"),
      showManagementLinks: roleNames.includes("admin") || roleNames.includes("coach"),
    };
  }

  const profile = await getProfile();

  if (!shouldUseDatabase()) {
    const roleNames = inferRoleNamesFromLabel(profile.role);

    return {
      name: profile.name,
      username: profile.username,
      avatar: profile.avatar,
      roleLabel: profile.role,
      roleNames,
      isAdmin: roleNames.includes("admin"),
      isCoach: roleNames.includes("coach"),
      isPlayer: roleNames.includes("player"),
      showManagementLinks: roleNames.includes("admin") || roleNames.includes("coach"),
    };
  }

  initModelAssociations();

  const user = await User.findByPk(getCurrentProfileUserId(), {
    include: [{ association: "roles" }],
  });

  const roleNames = (user?.roles ?? []).map((role) => role.name);

  return {
    name: profile.name,
    username: profile.username,
    avatar: profile.avatar,
    roleLabel: profile.role,
    roleNames,
    isAdmin: roleNames.includes("admin"),
    isCoach: roleNames.includes("coach"),
    isPlayer: roleNames.includes("player") || roleNames.length === 0,
    showManagementLinks: roleNames.includes("admin") || roleNames.includes("coach"),
  };
};
