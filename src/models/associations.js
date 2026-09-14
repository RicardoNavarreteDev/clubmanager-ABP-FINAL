// Este archivo declara las relaciones entre los modelos de Sequelize y las inicializa una sola vez.
import Category from "./category.model.js";
import Championship from "./championship.model.js";
import Club from "./club.model.js";
import ClubMembership from "./club-membership.model.js";
import Invitation from "./invitation.model.js";
import Match from "./match.model.js";
import Player from "./player.model.js";
import PlayerCategory from "./player-category.model.js";
import PlayerChampionship from "./player-championship.model.js";
import Role from "./role.model.js";
import Training from "./training.model.js";
import User from "./user.model.js";
import UserRole from "./user-role.model.js";

let initialized = false;

export function initModelAssociations() {
  if (initialized) {
    return;
  }

  User.hasOne(Player, { foreignKey: "user_id", as: "player" });
  Player.belongsTo(User, { foreignKey: "user_id", as: "user" });

  Club.hasMany(User, { foreignKey: "club_id", as: "users" });
  User.belongsTo(Club, { foreignKey: "club_id", as: "club" });
  User.hasMany(ClubMembership, { foreignKey: "user_id", as: "memberships" });
  ClubMembership.belongsTo(User, { foreignKey: "user_id", as: "member" });
  Club.hasMany(ClubMembership, { foreignKey: "club_id", as: "memberships" });
  ClubMembership.belongsTo(Club, { foreignKey: "club_id", as: "club" });
  ClubMembership.belongsTo(Role, { foreignKey: "role_id", as: "role" });

  Club.hasMany(Category, { foreignKey: { name: "clubId", field: "club_id" }, as: "categories" });
  Category.belongsTo(Club, { foreignKey: { name: "clubId", field: "club_id" }, as: "club" });

  Club.hasMany(Championship, { foreignKey: { name: "clubId", field: "club_id" }, as: "championships" });
  Championship.belongsTo(Club, { foreignKey: { name: "clubId", field: "club_id" }, as: "club" });

  Club.hasMany(Match, { foreignKey: { name: "clubId", field: "club_id" }, as: "matches" });
  Match.belongsTo(Club, { foreignKey: { name: "clubId", field: "club_id" }, as: "club" });

  Club.hasMany(Player, { foreignKey: { name: "clubId", field: "club_id" }, as: "clubPlayers" });
  Player.belongsTo(Club, { foreignKey: { name: "clubId", field: "club_id" }, as: "club" });

  Club.hasMany(Invitation, { foreignKey: { name: "clubId", field: "club_id" }, as: "invitations" });
  Invitation.belongsTo(Club, { foreignKey: { name: "clubId", field: "club_id" }, as: "club" });

  User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "user_id",
    otherKey: "role_id",
    as: "roles",
  });
  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "role_id",
    otherKey: "user_id",
    as: "users",
  });

  Player.belongsTo(Category, {
    foreignKey: "primary_category_id",
    as: "primaryCategory",
  });
  Category.hasMany(Player, {
    foreignKey: "primary_category_id",
    as: "primaryPlayers",
  });

  Player.belongsToMany(Category, {
    through: PlayerCategory,
    foreignKey: "player_id",
    otherKey: "category_id",
    as: "categories",
  });
  Category.belongsToMany(Player, {
    through: PlayerCategory,
    foreignKey: "category_id",
    otherKey: "player_id",
    as: "players",
  });

  Championship.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category",
  });
  Category.hasMany(Championship, {
    foreignKey: "category_id",
    as: "championships",
  });

  Player.belongsToMany(Championship, {
    through: PlayerChampionship,
    foreignKey: "player_id",
    otherKey: "championship_id",
    as: "championships",
  });
  Championship.belongsToMany(Player, {
    through: PlayerChampionship,
    foreignKey: "championship_id",
    otherKey: "player_id",
    as: "players",
  });

  Match.belongsTo(Championship, {
    foreignKey: "championship_id",
    as: "championship",
  });
  Championship.hasMany(Match, {
    foreignKey: "championship_id",
    as: "matches",
  });

  Training.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category",
  });
  Category.hasMany(Training, {
    foreignKey: "category_id",
    as: "trainings",
  });

  Invitation.belongsTo(Role, {
    foreignKey: "role_id",
    as: "role",
  });
  Invitation.belongsTo(Player, {
    foreignKey: "player_id",
    as: "player",
  });
  Invitation.belongsTo(Category, {
    foreignKey: "primary_category_id",
    as: "primaryCategory",
  });

  initialized = true;
}
