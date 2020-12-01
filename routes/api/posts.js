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
//@route Get api/posts/:id
//@desc get a  post by id
//@access private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.paramas.id);
    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }
    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "post not found" });
    }
    res.send(500).send("server error");
  }
});
//@route delete api/posts/:id
//@desc delete a post by id
//@access private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.paramas.id);
    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }
    //check on the user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not authorized" });
    }
    await post.remove();

    res.json({ msg: "post removed" });
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "post not found" });
    }
    res.send(500).send("server error");
  }
});
//@route put api/posts/like/:id
//@desc like a post
//@access private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if the post has been already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.send(500).send("server error");
  }
});
//@route put api/posts/unlike/:id
//@desc unlike a post
//@access private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if the post has been already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post has not yet been  liked" });
    }
    //get remove index

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.send(500).send("server error");
  }
});
module.exports = router;
