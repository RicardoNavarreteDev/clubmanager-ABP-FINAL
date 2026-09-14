import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.join(__dirname, "../../public/uploads/posts");
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const createHttpError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(uploadDirectory, { recursive: true });
      cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const safeExtension = allowedExtensions.has(extension) ? extension : ".jpg";
      cb(null, `post-${req.user.userId}-${Date.now()}-${randomUUID()}${safeExtension}`);
    },
  }),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
      cb(createHttpError("Solo se permiten imagenes JPG, JPEG, PNG o WEBP.", 400));
      return;
    }
    cb(null, true);
  },
});

export const uploadPostImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(createHttpError("La imagen supera el tamano maximo permitido de 4 MB.", 413));
      return;
    }
    if (error instanceof multer.MulterError) {
      next(createHttpError(error.message || "Archivo invalido.", 400));
      return;
    }
    next(error);
  });
};
