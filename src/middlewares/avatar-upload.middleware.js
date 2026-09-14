import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const avatarUploadDirectory = path.join(__dirname, "../../public/uploads/avatars");
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(avatarUploadDirectory, { recursive: true });
    cb(null, avatarUploadDirectory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeExtension = allowedExtensions.has(extension) ? extension : ".jpg";
    cb(null, `avatar-${req.user.userId}-${Date.now()}-${randomUUID()}${safeExtension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
      cb(createHttpError("Solo se permiten imagenes JPG, JPEG, PNG o WEBP.", 400));
      return;
    }

    cb(null, true);
  },
});

export const uploadAvatar = (req, res, next) => {
  upload.single("avatar")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(createHttpError("El avatar supera el tamano maximo permitido de 2 MB.", 413));
      return;
    }

    if (error instanceof multer.MulterError) {
      next(createHttpError(error.message || "Archivo invalido.", 400));
      return;
    }

    next(error);
  });
};
