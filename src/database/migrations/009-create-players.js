// Este archivo crea la tabla de jugadores.
import { DataTypes } from "sequelize";
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      "players",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        name: {
          type: DataTypes.STRING(120),
          allowNull: false,
        },
        position: {
          type: DataTypes.STRING(60),
          allowNull: true,
        },
        number: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        avatar: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        bio: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        location: {
          type: DataTypes.STRING(120),
          allowNull: true,
        },
        birth_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        team: {
          type: DataTypes.STRING(120),
          allowNull: true,
        },
        primary_category_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "categories",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
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
        ALTER TABLE players
        ADD CONSTRAINT players_valid_values
        CHECK (
          char_length(btrim(name)) > 0
          AND (number IS NULL OR number >= 0)
        );
      `,
      { transaction },
    );

    await queryInterface.addIndex("players", ["primary_category_id"], {
      name: "players_primary_category_id_idx",
      transaction,
    });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable("players", { transaction });
  });
}
