const express = require("express");

const app = express();
port = process.env.port || 5000;
app.get("/", (req, res) => {
  res.send("app works");
});

//the listener
app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
