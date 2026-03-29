import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "edtech_notes",
    resource_type: "raw", // CRITICAL: 'raw' prevents Cloudinary from rasterizing PDFs
    public_id: (req, file) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const originalName = file.originalname.replace(/\.[^/.]+$/, "");
      // CRITICAL: We MUST manually attach .pdf to the public_id for raw files
      return `${originalName}-${uniqueSuffix}.pdf`; 
    },
  },
});

export const uploadPdf = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "edtech_videos",
    resource_type: "video", 
    public_id: (req, file) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const originalName = file.originalname.replace(/\.[^/.]+$/, "");
      return `${originalName}-${uniqueSuffix}`; 
    },
  },
});

export const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: (req, file, cb) => {
    const isVideo = file.mimetype.startsWith("video/") || file.originalname.toLowerCase().match(/\.(mp4|mov|avi|mkv)$/);
    if (!isVideo) {
      return cb(new Error("Only Video files are allowed"));
    }
    cb(null, true);
  },
});

// No default export anymore
