const express = require("express");
const cors = require("cors");
const session = require("express-session");
const app = express();
const path = require("path");
app.use(
  cors({
    origin: "http://localhost:5173", // Reactin localhost dev - url
  }),
);
app.use(
  session({
    secret: "salainen salausavain",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 tunti
    },
  }),
);
const authRoutes = require("./routes/authRoutes");
app.use("/authenticate", authRoutes);
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(3000, () => {
  console.log("Palvelin käynnissä osoitteessa http://localhost:3000");
});
