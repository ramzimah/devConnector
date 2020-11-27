const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

//@route get api/profile/me
//@desc get current users profile
//@access private
router.get("/", auth, (req, res) => {
  res.send("profile route");
});

module.exports = router;
