import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readJsonFile = async (fileName) => {
  const filePath = path.join(__dirname, "../data", fileName);
  const fileContent = await readFile(filePath, "utf-8");
  return JSON.parse(fileContent);
};

export const getPlayers = () => readJsonFile("players.json");
export const getMatches = () => readJsonFile("matches.json");
export const getTrainings = () => readJsonFile("trainings.json");
export const getPosts = () => readJsonFile("posts.json");
export const getCategories = () => readJsonFile("categories.json");
export const getChampionships = () => readJsonFile("championships.json");
export const getPlayerChampionships = () => readJsonFile("player-championships.json");
export const getProfile = () => readJsonFile("profile.json");
export const getMatchCallups = () => readJsonFile("match-callups.json");
