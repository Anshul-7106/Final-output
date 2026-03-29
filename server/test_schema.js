import pool from "./config/db.js";

async function checkSchema() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='folders';");
    console.log("Folders columns:", res.rows.map(r => r.column_name).join(", "));
    const res2 = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='notes';");
    console.log("Notes columns:", res2.rows.map(r => r.column_name).join(", "));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}

checkSchema();
