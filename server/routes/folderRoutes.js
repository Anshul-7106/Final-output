import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Mock Admin Middleware 
const requireAdmin = (req, res, next) => {
  const email = req.headers["x-user-email"];
  const ADMIN_EMAILS = ["admin@gmail.com", "sudha@gmail.com", "sudhanshray10@gmail.com","vs5825982@gmail.com"];
  
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return res.status(403).json({ error: "Access Denied: Admins Only" });
  }
  next();
};

// CREATE FOLDER
router.post("/add", requireAdmin, async (req, res) => {
  try {
    const { name, parent_id, category = 'notes' } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    const result = await pool.query(
      "INSERT INTO folders (name, parent_id, category) VALUES ($1, $2, $3) RETURNING *",
      [name, parent_id || null, category]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating folder" });
  }
});

// GET FOLDERS BY PARENT_ID (or root folders if no parent_id provided)
router.get("/", async (req, res) => {
  try {
    const parentId = req.query.parent_id || null;
    const category = req.query.category || 'notes';
    let query;
    let params;

    if (parentId && parentId !== 'null' && parentId !== 'undefined') {
      query = "SELECT * FROM folders WHERE parent_id = $1 AND category = $2 ORDER BY name ASC";
      params = [parentId, category];
    } else {
      query = "SELECT * FROM folders WHERE parent_id IS NULL AND category = $1 ORDER BY name ASC";
      params = [category];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching folders" });
  }
});

// GET FOLDER BY ID (for breadcrumbs or details)
router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM folders WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Folder not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching folder details" });
    }
  });

// DELETE FOLDER
router.delete("/delete/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM folders WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Folder not found" });
    }

    res.json({ message: "Folder deleted successfully", folder: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting folder" });
  }
});

export default router;
