import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { q, category = 'notes' } = req.query;
    if (!q) {
      return res.json({ folders: [], notes: [] });
    }

    const searchStr = `%${q}%`;

    // Search folders by name
    const foldersResult = await pool.query(
      "SELECT id, name FROM folders WHERE name ILIKE $1 AND category = $2 LIMIT 5",
      [searchStr, category]
    );

    // Search notes by title or description
    const notesResult = await pool.query(
      "SELECT id, title, description, file_url, folder_id FROM notes WHERE (title ILIKE $1 OR description ILIKE $1) AND category = $2 LIMIT 10",
      [searchStr, category]
    );

    res.json({
      folders: foldersResult.rows,
      notes: notesResult.rows
    });
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ error: "Error performing search" });
  }
});

export default router;
