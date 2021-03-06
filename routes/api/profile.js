const express = require("express");
const request = require("request");
const config = require("config");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult, body } = require("express-validator");
//@route get api/profile/me
//@desc get current users profile
//@access private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "there is no profile for this user" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//@route get api/profile
//@desc create or update user profile
//@access private
router.post(
  "/",
  [
    auth,
    check("status", "status is required").not().isEmpty(),
    check("skills", "skills is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;
    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //buuild social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
    }
  }
);

//@route get api/profile
//@desc get all profile
//@access public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route get api/profile/user/:user_id
//@desc get profile by user id
//@access public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "profile not found" });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "profile not found" });
    }
    res.status(500).send("server error");
  }
});

//@route get api/profile
//@desc delete profile, user and post
//@access private

router.delete("/", auth, async (req, res) => {
  try {
    //@todo - remove user .posts
    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //remove user
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "user removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//@route put api/profile/experience
//@desc add profile experience
//@access private
router.put(
  "/experience",
  [
    auth,
    check("title", "title is required").not().isEmpty(),
    check("company", "title is required").not().isEmpty(),
    check("from", "title is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);
//@route Delete api/profile/:exp_id
//@desc delete profile experience
//@access private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//@route put api/profile/education
//@desc add profile education
//@access private
router.put(
  "/education",
  [
    auth,
    check("school", "school is required").not().isEmpty(),
    check("degree", "degree is required").not().isEmpty(),
    check("from", "title is required").not().isEmpty(),
    check("fieldofstudy", "fieldofstudy is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

//@route Delete api/profile/education/:edu_id
//@desc delete profile education
//@access private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//@route put api/profile/github/:username
//@desc get user repos from github
//@access public
router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri:
        "https://api.github.com/users/" +
        req.params.username +
        `/repos?per_page=&sort=created:asc&client_id=${config.get(
          "githubClientId"
        )}&client_secret=${config.get("githubSecret")}`,
      methode: "Get",
      headers: { "user-agent": "node.js" },
    };
    request(options, (error, response, body) => {
      if (error) throw error;
      if (response.statusCode !== 200) {
        console.log(response.statusCode);
        return res.status(404).json({ msg: "no github profile found" });
      }
      return res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
module.exports = router;
