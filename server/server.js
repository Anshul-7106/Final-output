import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import noteRoutes from "./routes/noteRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/notes", noteRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/search", searchRoutes);
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

app.get("/migrate", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_url VARCHAR(1000) NOT NULL,
        folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      ALTER TABLE notes 
      ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE;
    `);
    res.json({ success: true, message: "Migration complete" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.use("/api/folders", folderRoutes);

// DEBUG
console.log("ENV PASSWORD:", process.env.DB_PASSWORD);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(result.rows);
  } catch (err) {
    console.log("❌ ERROR START");
    console.log(err);
    console.log("❌ ERROR END");

    res.status(500).send("Database Error");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
