import fs from 'fs';
import path from 'path';

(async () => {
    try {
        // Create Folder
        const folderRes = await fetch("http://localhost:5000/api/folders/add", {
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
        
        const folder = await folderRes.json();
        console.log("Folder created:", folder);

        // Make sure dummy file exists
        if (!fs.existsSync('dummy.pdf')) {
            fs.writeFileSync('dummy.pdf', 'Example PDF Content');
        }

        // We use FormData for the note addition (must do it with Node.js FormData)
        // Since global fetch FormData is tricky with local files, we will use an alternative or use node-fetch form-data
        // Because of complexity with Node.js FormData and file uploading, let's just insert directly to DB? Wait, I can't.
        // Let's use standard POST form-data format.

    } catch (e) {
        console.error(e);
    }
})();
