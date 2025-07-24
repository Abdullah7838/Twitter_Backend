const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    username: { 
      type: String,
      default: function() {
        // Default to email username part if not provided
        return this.email ? this.email.split('@')[0] : '';
      }
    },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      default: function() {
        // Default to email username part if not provided
        return this.email ? this.email.split('@')[0] : '';
      }
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
      type: [CommentSchema],
      default: [],
    },
    hashtags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
