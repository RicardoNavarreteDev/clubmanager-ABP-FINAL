// Este archivo obtiene entrenamientos desde JSON o desde la base de datos segun el flag activo.
import Training from "../../models/training.model.js";
import { getTrainings as getTrainingsFromJson } from "../../shared/data/json.service.js";

const shouldUseDatabase = () => process.env.DB_READ_TRAININGS === "true";

// Este mapeo deja el mismo shape tanto si el entrenamiento vino de Sequelize como si vino desde JSON.
const mapTraining = (training) => ({
  id: training.id,
  categoryId: training.categoryId,
  trainingType: training.trainingType,
  date: training.date,
  time: training.time,
  location: training.location,
  createdAt: training.createdAt,
  updatedAt: training.updatedAt,
});

export const getTrainings = async () => {
  if (!shouldUseDatabase()) {
    return getTrainingsFromJson();
  }

  // Ordenamos por id para conservar el mismo orden que ya consumen las vistas.
  const trainings = await Training.findAll({
    order: [["id", "ASC"]],
  });

  return trainings.map((training) => mapTraining(training));
};
