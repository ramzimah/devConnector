const express = require("express");
const router = express.Router();

//@route get api/profile/me
//@desc get current users profile
//@access private
router.get("/", (req, res) => {
  res.send("profile route");
});

module.exports = router;
