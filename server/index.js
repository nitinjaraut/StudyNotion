const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // ✅ ONLY ONCE
const { cloudinaryConnect } = require("./config/couldinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();

// ---------------- PORT ----------------
const PORT = process.env.PORT || 4000;

// ---------------- DATABASE ----------------
database.connect();

// ---------------- MIDDLEWARES ----------------
app.use(express.json());
app.use(cookieParser());

// ✅ CORS CONFIG (credentials-safe)
const allowedOrigins = [
  "http://localhost:3000",
  "https://study-notion-117t.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / server-side

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ---------------- FILE UPLOAD ----------------
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// ---------------- CLOUDINARY ----------------
cloudinaryConnect();

// ---------------- ROUTES ----------------
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Your server is up and running ...",
  });
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});