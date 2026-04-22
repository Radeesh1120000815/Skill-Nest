import 'dotenv/config'; 
import app from './src/app.js';
import connectDB_Server from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// Connect Database first, then start server
if (process.env.SKIP_DB === 'true') {
    console.log('⚠️  SKIP_DB=true detected. Starting server without MongoDB connection.');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} else {
    // Use top-level await so server starts only after DB is ready
    (async () => {
        await connectDB_Server();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })();
}