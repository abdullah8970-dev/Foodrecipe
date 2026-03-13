const express = require("express")
const app = express();
const dotenv = require("dotenv").config({ path: __dirname + '/.env' });
const connectDB = require("./config/connectionDB");
const cors = require("cors");
const path = require("path")
const authMiddleware = require("./middleware/auth");

const PORT = process.env.PORT || 3000;
connectDB();
// Fix: Increase payload limit for images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Fix: Enable CORS for all origins (no credentials)
app.use(cors());
app.use("/", require("./routes/user"));

// Serve static files from the images directory
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use( "/recipe", require("./routes/recipe") );

app.listen(PORT, (err) => {
  console.log(`Server is running on port ${PORT}`);
});
