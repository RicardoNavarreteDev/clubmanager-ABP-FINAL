import { DataTypes } from "sequelize";

export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // Una invitacion sin club no tiene un destino valido y no debe poder aceptarse.
    await queryInterface.sequelize.query(
      "DELETE FROM invitations WHERE club_id IS NULL;",
      { transaction },
    );
    await queryInterface.changeColumn("invitations", "club_id", {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "clubs", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    }, { transaction });
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.changeColumn("invitations", "club_id", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "clubs", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    }, { transaction });
  });
}
