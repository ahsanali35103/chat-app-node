const mongoose = require('mongoose');
require('dotenv').config();
const logger = require('../utils/Logger');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info('MongoDB Connected...');
    } catch (err) {
        logger.error(`MongoDB connection failed: ${err.message}`);
        logger.warn('Continuing without database connection.');
    }
};

module.exports = connectDB;
