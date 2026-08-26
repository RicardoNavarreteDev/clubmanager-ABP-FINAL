// Este archivo obtiene invitaciones desde JSON o desde la base de datos segun el flag activo.
import Invitation from "../models/invitation.model.js";

const shouldUseDatabase = () => process.env.DB_READ_INVITATIONS === "true";

// Este mapeo deja las invitaciones con nombres de campo consistentes para el resto de la app.
const mapInvitation = (invitation) => ({
  id: invitation.id,
  email: invitation.email,
  name: invitation.name,
  roleId: invitation.roleId,
  playerId: invitation.playerId,
  primaryCategoryId: invitation.primaryCategoryId,
  status: invitation.status,
  token: invitation.token,
  expiresAt: invitation.expiresAt,
  acceptedAt: invitation.acceptedAt,
  createdAt: invitation.createdAt,
  updatedAt: invitation.updatedAt,
});

export const getInvitations = async () => {
  if (!shouldUseDatabase()) {
    // Por ahora no hay invitaciones en JSON, asi que sin DB devolvemos una lista vacia.
    return [];
  }

  // Ordenamos por id para mantener un orden estable al revisar invitaciones.
  const invitations = await Invitation.findAll({
    order: [["id", "ASC"]],
  });

  return invitations.map((invitation) => mapInvitation(invitation));
};

export const getInvitationByToken = async (token) => {
  if (!shouldUseDatabase()) {
    return null;
  }

  const invitation = await Invitation.findOne({
    where: { token },
  });

  return invitation ? mapInvitation(invitation) : null;
};
