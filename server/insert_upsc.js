import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    // 1. Create a Folder named "UPSC (General knowledge)"
    const folderRes = await pool.query(
      `INSERT INTO folders (name, parent_id) VALUES ($1, null) RETURNING id`,
      ["UPSC (General knowledge)"]
    );
    const folderId = folderRes.rows[0].id;
    
    // 2. Insert some Example Notes inside it
    await pool.query(
      `INSERT INTO notes (title, description, file_url, folder_id) VALUES ($1, $2, $3, $4)`,
      [
        "Indian Polity - Constitution",
        "A comprehensive summary of the Indian Constitution, detailing Fundamental Rights and Duties.",
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        folderId
      ]
    );

    await pool.query(
      `INSERT INTO notes (title, description, file_url, folder_id) VALUES ($1, $2, $3, $4)`,
      [
        "Modern Indian History",
        "Key events from 1857 to 1947. Learn about the freedom struggle and key personalities.",
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        folderId
      ]
    );

    console.log("Successfully inserted UPSC dummy data!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

main();
