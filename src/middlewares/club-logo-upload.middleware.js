import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoUploadDirectory = path.join(__dirname, "../../public/uploads/clubs");
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(logoUploadDirectory, { recursive: true });
    cb(null, logoUploadDirectory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `club-${Date.now()}-${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
      cb(createHttpError("Solo se permiten logos JPG, JPEG, PNG o WEBP.", 400));
      return;
    }

    cb(null, true);
  },
});

export const uploadClubLogo = (req, res, next) => {
  upload.single("logo")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      req.clubLogoUploadError = createHttpError("El logo supera el tamano maximo permitido de 2 MB.", 413);
      next();
      return;
    }

    req.clubLogoUploadError = error;
    next();
  });
};
