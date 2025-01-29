const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    post: {
      type: String,
      required: true,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    likes: {
      type: [String], 
      default: [],
    },
    comments: {
      type: [
        {
          email: { type: String, required: true },
          comment: { type: String, required: true },
        }
      ], 
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
