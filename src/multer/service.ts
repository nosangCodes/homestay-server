import { Request } from "express";
import multer, { FileFilterCallback } from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
  } else {
    callback(null, false);
    return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE"));
  }
};

export const imageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2000000,
  },
});
