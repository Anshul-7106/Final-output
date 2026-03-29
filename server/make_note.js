import fs from 'fs';

async function main() {
  try {
    console.log("Creating folder...");
    const folderRes = await fetch("http://127.0.0.1:5000/api/folders/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": "admin@gmail.com"
      },
      body: JSON.stringify({
        name: "UPSC (General knowledge)",
        parent_id: null
      })
    });
    
    if (!folderRes.ok) {
        throw new Error("Failed to create folder: " + await folderRes.text());
    }

    const folder = await folderRes.json();
    console.log("Folder created! ID:", folder.id);

    // Create a dummy PDF to upload
    if (!fs.existsSync("dummy_upsc.pdf")) {
      fs.writeFileSync("dummy_upsc.pdf", "Mock PDF content for UPSC module.");
    }
    const pdfBlob = new Blob([fs.readFileSync("dummy_upsc.pdf")], { type: 'application/pdf' });

    console.log("Creating notes...");
    
    // Notes endpoint uses FormData
    const formData = new FormData();
    formData.append("title", "UPSC General Knowledge - Module 1");
    formData.append("description", "A mock study material PDF covering Ancient History, Geography, and Polity.");
    formData.append("youtube_url", "https://www.youtube.com/watch?v=LXb3EKWsInQ");
    formData.append("folder_id", folder.id);
    formData.append("file", pdfBlob, "dummy_upsc.pdf");

    const noteRes = await fetch("http://127.0.0.1:5000/api/notes/add", {
      method: "POST",
      headers: {
        "x-user-email": "admin@gmail.com"
      },
      body: formData
    });

    if (!noteRes.ok) {
        throw new Error("Failed to create note: " + await noteRes.text());
    }

    const note = await noteRes.json();
    console.log("Note created successfully!", note);

  } catch (err) {
    console.error("Error generating example notes:", err);
  }
}

main();
