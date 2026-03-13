const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: __dirname + '/../.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1); // Exit process with failure
  }     
};

module.exports = connectDB;