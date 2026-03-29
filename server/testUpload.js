import cloudinary from "./config/cloudinary.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// create dummy pdf
const dummyPath = path.join(__dirname, "dummy.pdf");
fs.writeFileSync(dummyPath, "%PDF-1.4\n%EOF\n");

async function run() {
  try {
    const res = await cloudinary.uploader.upload(dummyPath, {
      folder: "edtech_notes_test",
      resource_type: "image",
      format: "pdf"
    });
    console.log("UPLOAD SUCCESS:", res.secure_url);
    
    // Check headers of the secure_url
    const fetchRes = await fetch(res.secure_url);
    console.log("STATUS:", fetchRes.status);
    console.log("CONTENT-TYPE:", fetchRes.headers.get("content-type"));
    console.log("CONTENT-DISPOSITION:", fetchRes.headers.get("content-disposition"));
    
  } catch (err) {
    console.error("ERROR:", err);
  }
}
run();
