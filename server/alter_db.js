import pool from "./config/db.js";

async function addYoutubeUrlColumn() {
  try {
    await pool.query("ALTER TABLE notes ADD COLUMN IF NOT EXISTS youtube_url TEXT;");
    console.log("Successfully added youtube_url column to notes table.");
  } catch (err) {
    console.error("Error adding column:", err);
  } finally {
    pool.end();
  }
}

addYoutubeUrlColumn();
