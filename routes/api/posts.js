const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const post = require("../../models/Post");
const Post = require("../../models/Post");
//@route post api/posts
//@desc test route
//@access private
router.post(
  "/",
  [auth, check("text", "text is required").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.this.status(400).json({ errors: errors.array });
    }

    try {
      const user = await (await User.findOneById(req.user.id)).select(
        "-password"
      );
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.log(err.message);
      res.send(500).send("server error");
    }
  }
);
//@route Get api/posts
//@desc Get all posts
//@access private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    res.send(500).send("server error");
  }
});

module.exports = router;
