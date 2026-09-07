// Este archivo renderiza la pantalla web de gestion de invitaciones.
import { getCategories } from "../categories/categories.service.js";
import { getInvitations } from "./invitations.service.js";
import { getRoles } from "../roles/roles.service.js";

const mapStatusLabel = (status) => {
  if (status === "pending") {
    return "Pendiente";
  }

  if (status === "accepted") {
    return "Aceptada";
  }

  if (status === "expired") {
    return "Expirada";
  }

  if (status === "cancelled") {
    return "Cancelada";
  }

  return status;
};

const mapStatusTone = (status) => {
  if (status === "accepted") {
    return "positive";
  }

  if (status === "cancelled" || status === "expired") {
    return "negative";
  }

  return "neutral";
};

const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const renderInvitationsManagement = async (req, res) => {
  const clubId = req.authSession?.user?.clubId ?? null;
  const [invitations, roles, categories] = await Promise.all([
    getInvitations({ clubId }),
    getRoles(),
    getCategories({ clubId }),
  ]);
  const currentRoleNames = res.locals.currentViewer?.roleNames ?? [];
  const visibleRoles = currentRoleNames.includes("admin")
    ? roles
    : roles.filter((role) => role.name === "player");

  const visibleInvitations = process.env.APP_DEMO_MODE === "false" && req.authSession?.user?.club
    ? invitations.filter((invitation) => new Date(invitation.createdAt) >= new Date(req.authSession.user.club.createdAt ?? 0))
    : invitations;
  const normalizedInvitations = visibleInvitations.map((invitation) => ({
    ...invitation,
    expiresAt: formatDateTime(invitation.expiresAt),
    statusLabel: mapStatusLabel(invitation.status),
    statusTone: mapStatusTone(invitation.status),
    canChangeStatus: invitation.status === "pending",
  }));

  res.render("invitations", {
    roles: visibleRoles,
    categories,
    invitations: normalizedInvitations,
  });
};
