import fs from "fs";
import path from "path";
import nodeCron from "node-cron";

const cleanupFiles = () => {
    nodeCron.schedule("0 * * * *", () => {
        const __dirname = path.resolve();
        const uploadsDir = path.join(__dirname, "uploads");
        const now = Date.now();
        const expirationTime = 24 * 60 * 60 * 1000 + 60 * 60 * 1000;

        fs.readdir(uploadsDir, (err, files) => {
            if (err) return;

            files.forEach((file) => {
                if (file.startsWith("post-")) {
                    const filePath = path.join(uploadsDir, file);
                    fs.stat(filePath, (err, stats) => {
                        if (err) return;

                        if (now - stats.mtimeMs > expirationTime) {
                            fs.unlink(filePath, (err) => {
                                if (err) console.error("Silme hatası:", err);
                                else console.log(`Eski post dosyası temizlendi: ${file}`);
                            });
                        }
                    });
                }
            });
        });
    });
};

export default cleanupFiles;
