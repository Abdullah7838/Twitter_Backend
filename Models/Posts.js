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
  },
  {
    timestamps: true, 
  }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
