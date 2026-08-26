// Este archivo inserta las invitaciones iniciales del sistema.
export async function up({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.bulkInsert(
      "invitations",
      [
        {
          id: 1,
          email: "asistente@clubmanager.dev",
          name: "Pablo Medina",
          role_id: 2,
          player_id: null,
          primary_category_id: null,
          status: "pending",
          token: "seed-invite-coach-001",
          expires_at: new Date("2027-01-15T23:59:59Z"),
          accepted_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          email: "nuevo-jugador@clubmanager.dev",
          name: "Martin Lagos",
          role_id: 3,
          player_id: null,
          primary_category_id: 2,
          status: "pending",
          token: "seed-invite-player-001",
          expires_at: new Date("2027-01-15T23:59:59Z"),
          accepted_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { transaction },
    );

    await queryInterface.sequelize.query(
      "SELECT setval('invitations_id_seq', (SELECT MAX(id) FROM invitations));",
      { transaction },
    );
  });
}

export async function down({ context: queryInterface }) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      "DELETE FROM invitations WHERE id IN (1, 2);",
      { transaction },
    );
  });
}
