// Habilita cuentas multi-club sin eliminar datos creados por los usuarios.
import { DataTypes } from "sequelize";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable("club_memberships", {
      id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      club_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "clubs", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      role_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "roles", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
      is_owner: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    }, { transaction });
    await queryInterface.addConstraint("club_memberships", { fields: ["user_id", "club_id"], type: "unique", name: "club_memberships_user_club_unique", transaction });
    await queryInterface.addIndex("club_memberships", ["club_id"], { name: "club_memberships_club_id_idx", transaction });

    await queryInterface.sequelize.query(
      `
        INSERT INTO club_memberships (user_id, club_id, role_id, is_owner, created_at, updated_at)
        SELECT DISTINCT ON (users.id, users.club_id)
          users.id,
          users.club_id,
          user_roles.role_id,
          roles.name = 'admin',
          NOW(),
          NOW()
        FROM users
        JOIN user_roles ON user_roles.user_id = users.id
        JOIN roles ON roles.id = user_roles.role_id
        WHERE users.club_id IS NOT NULL
        ORDER BY users.id, users.club_id, user_roles.role_id;
      `,
      { transaction },
    );

    // Las cuentas demo antiguas no pertenecen a un club y usaban passwords conocidas.
    await queryInterface.sequelize.query(
      `
        UPDATE players
        SET user_id = NULL
        WHERE user_id IN (
          SELECT id
          FROM users
          WHERE club_id IS NULL
            AND (id, email) IN (
              (1, 'admin@clubmanager.dev'),
              (2, 'coach@clubmanager.dev'),
              (3, 'ricardo@clubmanager.dev')
            )
        );

        DELETE FROM users
        WHERE club_id IS NULL
          AND (id, email) IN (
            (1, 'admin@clubmanager.dev'),
            (2, 'coach@clubmanager.dev'),
            (3, 'ricardo@clubmanager.dev')
          );
      `,
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable("club_memberships", { transaction });
  });
}
