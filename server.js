const express = require("express");
const connectdb = require("./config/db");

connectdb();
const app = express();
port = process.env.port || 5000;

//init middelware
app.use(express.json({ extended: false }));
app.get("/", (req, res) => {
  res.send("app works");
});

//defining routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));
//the listener
app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
