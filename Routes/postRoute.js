const express = require("express");
const Post = require("../models/Posts"); 

const router = express.Router();

// @route   POST /api/posts

router.post("/post", async (req, res) => {
  try {
    const { email, post, username } = req.body;

    if (!email || !post) {
      return res.status(400).json({ message: "Email and post content are required" });
    }

    // Extract hashtags from post content
    const hashtags = [];
    const hashtagRegex = /#(\w+)/g;
    let match;
    
    while ((match = hashtagRegex.exec(post)) !== null) {
      hashtags.push(match[1].toLowerCase());
    }

    const newPost = new Post({ 
      email, 
      post, 
      hashtags,
      username: username || email.split('@')[0] // Use provided username or default to email
    });
    await newPost.save();

    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/post", async (req, res) => {
    try {
      const { hashtag } = req.query;
      let query = {};
      
      // If hashtag is provided, filter posts by that hashtag
      if (hashtag) {
        query = { hashtags: hashtag.toLowerCase() };
      }
      
      const posts = await Post.find(query);
  
      if (posts.length === 0) {
        return res.status(404).json({ message: "No posts found" }); 
      }
  
      res.status(200).json({ message: "Posts retrieved successfully", posts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.get('/post/:id', async (req, res) => {
    const { id } = req.params; 
  
    try {
      const post = await Post.findById(id);
  
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      res.status(200).json({ message: "Post retrieved successfully", post });
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

router.post('/likes/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const hasLiked = post.likes.includes(email);

    if (hasLiked) {
      post.likes = post.likes.filter((user) => user !== email);
    } else {
      post.likes.push(email);
    }

    await post.save();
    res.status(200).json({ message: hasLiked ? "Unliked" : "Liked", likes: post.likes.length });

  } catch (error) {
    console.error("Error updating likes:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/all-likes', async (req, res) => {
  try {
    const posts = await Post.find({}, 'post likes'); 

    const formattedPosts = posts.map((post) => ({
      _id: post._id,
      post: post.post,
      likesCount: post.likes.length, 
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, comment, username } = req.body;

    if (!email || !comment) {
      return res.status(400).json({ message: "Email and comment are required" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({ 
      email, 
      comment, 
      username: username || email.split('@')[0] // Use provided username or default to email
    });
    await post.save();

    res.status(201).json({ message: "Comment added successfully", comments: post.comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get('/comments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json({ comments: post.comments,email:post.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete('/comments/:commentId', async (req, res) => {
  const { commentId } = req.params; 

  try {
    const post = await Post.findOne({ "comments._id": commentId });

    if (!post) {
      return res.status(404).json({ error: "Post not found for the given comment" });
    }
    const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ error: "Comment not found" });
    }
    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/posts', async (req, res) => {
  try {
    const data = await Post.find();
    return res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get trending hashtags
router.get('/trending-hashtags', async (req, res) => {
  try {
    // Get limit from query params or default to 5
    const limit = parseInt(req.query.limit) || 5;
    
    // Aggregate posts to count hashtag occurrences
    const posts = await Post.find({ hashtags: { $exists: true, $ne: [] } });
    
    // Count hashtag occurrences
    const hashtagCounts = {};
    posts.forEach(post => {
      post.hashtags.forEach(tag => {
        if (hashtagCounts[tag]) {
          hashtagCounts[tag]++;
        } else {
          hashtagCounts[tag] = 1;
        }
      });
    });
    
    // Convert to array and sort by count
    const trendingHashtags = Object.keys(hashtagCounts).map(tag => ({
      tag,
      count: hashtagCounts[tag]
    })).sort((a, b) => b.count - a.count).slice(0, limit);
    
    return res.status(200).json({ hashtags: trendingHashtags });
  } catch (error) {
    console.error("Error fetching trending hashtags:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
