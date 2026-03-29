import express from "express";
import pool from "../config/db.js";
import { uploadPdf, uploadVideo } from "../config/multer.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

// Helper to extract Cloudinary public_id from file_url
const extractPublicId = (url) => {
  if (!url) return null;
  const matches = url.match(/\/v\d+\/(.+)$/);
  return matches ? matches[1] : null;
};

const router = express.Router();

// ✅ Mock Admin Middleware
const requireAdmin = (req, res, next) => {
  const email = req.headers["x-user-email"];
  const ADMIN_EMAILS = [
    "admin@gmail.com",
    "sudha@gmail.com",
    "sudhanshray10@gmail.com",
    "vs5825982@gmail.com"
  ];

  if (!email || !ADMIN_EMAILS.includes(email)) {
    return res.status(403).json({ error: "Access Denied: Admins Only" });
  }
  next();
};

// ✅ ADD NOTE (PDF ONLY)
router.post("/add", requireAdmin, uploadPdf.single("file"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const title = req.body?.title;
    const description = req.body?.description;
    const youtube_url = req.body?.youtube_url || null;

    // safer conversion
    const folder_id =
      req.body?.folder_id &&
      req.body.folder_id !== "null" &&
      req.body.folder_id !== "undefined"
        ? Number(req.body.folder_id)
        : null;

    if (!title || !description || (!req.file && !youtube_url)) {
      return res.status(400).json({
        error: "Missing fields: Must provide either a file or a Youtube URL",
        body: req.body,
        file: req.file
      });
    }

    const file_url = req.file ? (req.file.path || req.file.secure_url || req.file.url) : "";

    const category = req.body?.category || 'notes';

    const result = await pool.query(
      "INSERT INTO notes (title, description, file_url, folder_id, youtube_url, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, file_url, folder_id, youtube_url, category]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR ADD:", err);
    res.status(500).json({ error: err.message }); // 🔥 IMPORTANT
  }
});

// ✅ DELETE NOTE
router.delete("/delete/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM notes WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    const deletedNote = result.rows[0];

    // Wipe file completely from Cloudinary Backend
    if (deletedNote.file_url) {
      const publicId = extractPublicId(deletedNote.file_url);
      if (publicId) {
        const rType = deletedNote.category === 'video' ? 'video' : 'raw';
        cloudinary.uploader.destroy(publicId, { resource_type: rType })
          .then(res => console.log("Cloudinary Wipe:", res))
          .catch(err => console.error("Cloudinary Delete Error:", err));
      }
    }

    res.json({
      message: "Note deleted successfully",
      note: result.rows[0]
    });
  } catch (err) {
    console.error("ERROR DELETE:", err);
    res.status(500).json({ error: err.message }); // 🔥 IMPORTANT
  }
});

// ✅ GET NOTES
router.get("/", async (req, res) => {
  try {
    const folderId =
      req.query.folder_id &&
      req.query.folder_id !== "null" &&
      req.query.folder_id !== "undefined"
        ? Number(req.query.folder_id)
        : null;

    const category = req.query.category || 'notes';
    let result;

    if (folderId !== null) {
      result = await pool.query(
        "SELECT * FROM notes WHERE folder_id = $1 AND category = $2 ORDER BY id DESC",
        [folderId, category]
      );
    } else {
      result = await pool.query(
        "SELECT * FROM notes WHERE folder_id IS NULL AND category = $1 ORDER BY id DESC",
        [category]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("ERROR FETCH:", err);
    res.status(500).json({ error: err.message }); // 🔥 IMPORTANT
  }
});

// ✅ ADD VIDEO NOTE (YOUTUBE ONLY)
const uploadFields = multer().none();
router.post("/add-video", requireAdmin, uploadFields, async (req, res) => {
  try {
    const title = req.body?.title;
    const description = req.body?.description;
    const youtube_url = req.body?.youtube_url || null;

    const folder_id =
      req.body?.folder_id &&
      req.body.folder_id !== "null" &&
      req.body.folder_id !== "undefined"
        ? Number(req.body.folder_id)
        : null;

    if (!title || !description || !youtube_url) {
      return res.status(400).json({ error: "Missing fields: Must provide a Youtube URL" });
    }

    const file_url = "";

    const category = req.body?.category || 'video'; // Force video

    const result = await pool.query(
      "INSERT INTO notes (title, description, file_url, folder_id, youtube_url, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, file_url, folder_id, youtube_url, category]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR ADD VIDEO:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;