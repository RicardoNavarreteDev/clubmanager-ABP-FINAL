// Este archivo obtiene las publicaciones del home desde la fuente JSON actual.
import { getPosts as getPostsFromJson } from "../../shared/data/json.service.js";

export const getPosts = async () => getPostsFromJson();
