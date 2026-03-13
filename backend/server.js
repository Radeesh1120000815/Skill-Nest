import 'dotenv/config'; 
import app from './src/app.js';
import connectDB_Server from './src/config/db.js';

const PORT = process.env.PORT || 5001;

// Connect Database
connectDB_Server();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});