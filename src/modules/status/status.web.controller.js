// Este archivo responde el endpoint de estado del servidor en formato JSON.
export const getStatus = (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor funcionando",
  });
};
