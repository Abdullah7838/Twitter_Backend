const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const cloudinary = require('../cloudinary');
const { findOne } = require('../models/Posts');
const router = express.Router();
const JWT_SECRET = "your_jwt_secret_key";
const Post = require("../models/Posts"); 


router.post("/upload-profile", async (req, res) => {
    try {
        const { image, email } = req.body;

        if (!email || !image) {
            return res.status(400).json({ message: "Email and image are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const publicId = `profile_photos/${user.email}`;

        if (user.profilePhoto) {
            const cloudinaryResponse = await cloudinary.uploader.destroy(publicId);
            console.log("Deleted old profile photo from Cloudinary:", cloudinaryResponse);
        }

        const uploadResponse = await cloudinary.uploader.upload(image, {
            public_id: publicId, 
            folder: "meme-text",  
        });

        if (!uploadResponse.secure_url) {
            return res.status(500).json({ message: "Error uploading to Cloudinary" });
        }

        user.profilePhoto = uploadResponse.secure_url;
        await user.save();

        return res.status(200).json({ message: "Profile photo updated successfully", profilePhoto: user.profilePhoto });
    } catch (error) {
        console.error("Error uploading profile photo:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/get-profile", async (req, res) => {
    try {
        const { email } = req.query; 

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user || !user.profilePhoto) {
            return res.status(404).json({ message: "Profile photo not found" });
        }

        return res.status(200).json({ profilePhoto: user.profilePhoto });
    } catch (error) {
        console.error("Error fetching profile photo:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            email,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ message: "User registered successfully", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/followers', async (req, res) => {
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ followers: user.followers });
    } catch (error) {
        console.error("Error fetching followers:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/follow', async (req, res) => {
    const { email, followerEmail } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.followers.includes(followerEmail)) {
            return res.status(400).json({ message: "Already following" });
        }

        if (!user.followers.includes(followerEmail)) {
            user.followers.push(followerEmail);
            await user.save();
        }

        return res.status(200).json({ message: "Follower added successfully", followers: user.followers });
    } catch (error) {
        console.error("Error adding follower:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Remove a Follower
router.post('/unfollow', async (req, res) => {
    const { email, followerEmail } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.followers = user.followers.filter(f => f !== followerEmail);
        await user.save();

        return res.status(200).json({ message: "Follower removed successfully", followers: user.followers });
    } catch (error) {
        console.error("Error removing follower:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/admin',async(req,res)=>{
    const data = await User.find()
    try{
        return res.status(200).json({ data });

    }catch(error){
    console.error("Error removing follower:", error);
    return res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/users/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await Post.deleteMany({ email: user.email });
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const users = await User.find();
      res.status(200).json({ message: "User and their posts deleted successfully", users });
    } catch (error) {
      console.error("Error deleting user and posts:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  
module.exports = router;
