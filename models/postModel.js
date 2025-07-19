const mongoose = require("mongoose");

//schema
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "please add post title"],
    },
    description: {
      type: String,
      required: [true, "please add post description"],
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      },
   images: [
      {
        public_id: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
