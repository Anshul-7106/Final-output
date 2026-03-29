import pool from "./config/db.js";

async function addCategoryColumn() {
  try {
    await pool.query("ALTER TABLE folders ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'notes';");
    console.log("Successfully added category column to folders table.");
    
    await pool.query("ALTER TABLE notes ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'notes';");
    console.log("Successfully added category column to notes table.");
  } catch (err) {
    console.error("Error adding category column:", err);
  } finally {
    pool.end();
  }
}

addCategoryColumn();
