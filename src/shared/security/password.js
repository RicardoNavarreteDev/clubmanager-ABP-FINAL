// Utilidad compartida para hash de passwords con bcrypt y compatibilidad legacy sha256.
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";

const LEGACY_SHA256_LENGTH = 64;

export const isBcryptHash = (value) => typeof value === "string" && value.startsWith("$2");

export const hashLegacySha256 = (password) => createHash("sha256").update(password).digest("hex");

export const hashPassword = async (password) => bcrypt.hash(password, 10);

export const verifyPassword = async (password, storedHash) => {
  if (!storedHash) {
    return { ok: false, needsRehash: false };
  }

  if (isBcryptHash(storedHash)) {
    const ok = await bcrypt.compare(password, storedHash);
    return { ok, needsRehash: false };
  }

  // Compatibilidad con seeds y cuentas creadas con sha256 simple.
  if (storedHash.length === LEGACY_SHA256_LENGTH) {
    const ok = hashLegacySha256(password) === storedHash;
    return { ok, needsRehash: ok };
  }

  return { ok: false, needsRehash: false };
};
