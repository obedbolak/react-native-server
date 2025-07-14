const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/config.js");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");



//DOTENV
dotenv.config();

// MONGODB CONNECTION
connectDB();

//Initialising Cloudinary

cloudinary.config({ 
        cloud_name:`${process.env.CLOUDINARY_CLOUD_NAME}`, 
        api_key:`${process.env.CLOUDINARY_API_KEY}`,  
        api_secret:`${process.env.CLOUDINARY_API_SECRET}` 
        // Click 'View API Keys' above to copy your API secret
    });


//REST OBJECT
const app = express();

//middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//ROUTES
app.use("/api/v1/auth", require("./routes/userRoutes"));
app.use("/api/v1/post", require("./routes/postRoutes"));
app.use("/api/v1/product", require("./routes/productRoutes"));

//PORT
const PORT = process.env.PORT || 5000;

//listen
app.listen(PORT, () => {
  console.log(`Server Runnning ${PORT}`.bgGreen.white);
});






