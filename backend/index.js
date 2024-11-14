import express from "express";
import dotenv from "dotenv";
dotenv.config();

import dbConnetion from "./config/dbConnection.js";

import authRoutes from "./routes/auth.route.js";

dbConnetion();

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
