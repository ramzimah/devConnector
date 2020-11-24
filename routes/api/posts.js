const express = require("express");
const router = express.Router();

//@route get api/posts
//@desc test route
//@access public
router.get("/", (req, res) => {
  res.send("post route");
});

module.exports = router;
