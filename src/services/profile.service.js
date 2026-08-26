// Este archivo arma el perfil visible usando JSON o la base de datos segun la configuracion.
import User from "../models/user.model.js";
import { initModelAssociations } from "../models/associations.js";
import { getProfile as getProfileFromJson } from "./json.service.js";

const shouldUseDatabase = () => process.env.DB_READ_PROFILE === "true";
const getCurrentProfileUserId = () => Number(process.env.DB_PROFILE_USER_ID ?? 3);

// Traducimos los nombres tecnicos de rol a etiquetas mas humanas para la UI.
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

export const getProfile = async () => {
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
