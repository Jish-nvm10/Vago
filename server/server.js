const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes =
  require("./routes/auth");

const plannerRoutes =
  require("./routes/planner");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/planner",
  plannerRoutes
);


/* ROOT ROUTE */

app.get("/", (req, res) => {

  res.send("Vago API Running 🚀");

});


const PORT =
  process.env.PORT || 5001;

app.listen(PORT, () => {

  console.log(
    `Server running on ${PORT}`
  );

});