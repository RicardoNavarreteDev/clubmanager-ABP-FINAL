// Este archivo crea el club de la instalacion y permite asociar sus usuarios.
import { DataTypes } from "sequelize";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      "clubs",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(120),
          allowNull: false,
        },
        sport: {
          type: DataTypes.STRING(80),
          allowNull: false,
        },
        location: {
          type: DataTypes.STRING(160),
          allowNull: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        logo: {
          type: DataTypes.STRING(255),
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
        ALTER TABLE clubs
        ADD CONSTRAINT clubs_valid_values
        CHECK (
          char_length(btrim(name)) > 0
          AND char_length(btrim(sport)) > 0
        );
      `,
      { transaction },
    );

    await queryInterface.addColumn(
      "users",
      "club_id",
      {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "clubs",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      { transaction },
    );

    await queryInterface.addIndex("users", ["club_id"], {
      name: "users_club_id_idx",
      transaction,
    });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeColumn("users", "club_id", { transaction });
    await queryInterface.dropTable("clubs", { transaction });
  });
}
