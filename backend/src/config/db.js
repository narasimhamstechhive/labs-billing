import mongoose from 'mongoose';
// import logger from '../utils/logger.js';

const connectDB = async (retryCount = 5) => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Database connection error: ${err.message}`);
        if (retryCount > 0) {
            console.log(`Retrying connection... (${retryCount} attempts left)`);
            setTimeout(() => connectDB(retryCount - 1), 5000);
        } else {
            console.error('Max database connection retries reached. Exiting...');
            process.exit(1);
        }
    }
};

export default connectDB;
