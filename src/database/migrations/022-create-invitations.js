// Este archivo crea la tabla de invitaciones.
import { DataTypes } from "sequelize";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      "invitations",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING(160),
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(120),
          allowNull: false,
        },
        role_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "roles",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        player_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "players",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        primary_category_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "categories",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        status: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        token: {
          type: DataTypes.STRING(120),
          allowNull: false,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        accepted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
        ALTER TABLE invitations
        ADD CONSTRAINT invitations_valid_values
        CHECK (
          char_length(btrim(email)) > 0
          AND POSITION('@' IN email) > 1
          AND char_length(btrim(name)) > 0
          AND char_length(btrim(token)) > 0
          AND status IN ('pending', 'accepted', 'expired', 'cancelled')
        );
      `,
      { transaction },
    );

    await queryInterface.sequelize.query(
      "CREATE UNIQUE INDEX invitations_token_unique ON invitations (token);",
      { transaction },
    );

    await queryInterface.addIndex("invitations", ["email"], {
      name: "invitations_email_idx",
      transaction,
    });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable("invitations", { transaction });
  });
}
