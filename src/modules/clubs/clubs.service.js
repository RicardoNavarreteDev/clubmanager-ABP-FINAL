import Club from "../../models/club.model.js";

export const getCurrentClub = async () => Club.findByPk(1);
