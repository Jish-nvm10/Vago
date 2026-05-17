const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/.env" });

const authRoutes = require("./routes/auth");
const plannerRoutes = require("./routes/planner");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/planner", plannerRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Vago Server running on port ${process.env.PORT}`);
});