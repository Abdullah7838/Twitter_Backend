const express = require("express");
const Post = require("../models/Posts"); 

const router = express.Router();

// @route   POST /api/posts

router.post("/post", async (req, res) => {
  try {
    const { email, post } = req.body;

    if (!email || !post) {
      return res.status(400).json({ message: "Email and post content are required" });
    }

    const newPost = new Post({ email, post });
    await newPost.save();

    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/post", async (req, res) => {
    try {
      const posts = await Post.find();
  
      if (posts.length === 0) {
        return res.status(404).json({ message: "No posts found" }); 
      }
  
      res.status(200).json({ message: "Posts retrieved successfully", posts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

// @route   DELETE /api/posts/:id

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/posts/user/:email

router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const posts = await Post.find({ email }).sort({ postedAt: -1 });

    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this email" });
    }

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
