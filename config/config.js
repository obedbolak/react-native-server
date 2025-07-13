const mongoose = require("mongoose");
const colors = require("colors");


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, 
      
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`.green);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`.bgRed.white);
    process.exit(1); // Exit the process if the connection fails
  }
};

module.exports = connectDB;