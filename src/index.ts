import { app } from './app.js';
import { initDatabase } from './db/init.js';

const PORT = process.env['PORT'] || 3000;

async function startServer() {
    try {
        await initDatabase();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server due to DB error:", err);
        process.exit(1);
    }
}

startServer();