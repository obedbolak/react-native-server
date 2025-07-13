const postModel = require("../models/postModel.js");
const { getDataUri } = require("../utils/dataUri.js");
const cloudinary = require("cloudinary");
// create post
const createPostController = async (req, res) => {
  try {
    const { title, description } = req.body;
    //validate
    if (!title || !description) {
      return res.status(400).send({  // Changed from 500 to 400 (client error)
        success: false,
        message: "Please Provide All Fields",
      });
    }
     
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Please provide post images",
      });
    }

     // Initialize an array to hold image data
    const imagesArray = [];

    // Loop through each file uploaded
    for (let file of req.files) {
      const fileUri = getDataUri(file); // Convert file to Data URI
      const cdb = await cloudinary.v2.uploader.upload(fileUri.content); // Upload to Cloudinary

      const image = {
        public_id: cdb.public_id,
        url: cdb.secure_url,
      };

      // Add the image to the array
      imagesArray.push(image);
    }

    const post = await postModel({
      title,
      description,
      postedBy: req.auth._id,
      images: imagesArray,
    }).save();

    res.status(201).send({
      success: true,
      message: "Post Created Successfully",
      post,
    });

  } catch (error) {
    console.error("Error in createPostController:", error);
    res.status(500).send({
      success: false,
      message: "Error in Create Post API",
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// GET ALL POSTS
const getAllPostsContoller = async (req, res) => {
  try {
    const posts = await postModel
      .find()
      .populate("postedBy", "_id name")
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "All Posts Data",
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In GETALLPOSTS API",
      error,
    });
  }
};

// get user posts
const getUserPostsController = async (req, res) => {
  try {
    const userPosts = await postModel.find({ postedBy: req.auth._id });
    res.status(200).send({
      success: true,
      message: "user posts",
      userPosts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in User POST API",
      error,
    });
  }
};

// delete post
const deletePostController = async (req, res) => {
  try {
     if (!req.params.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not authenticated",
      });
    }

     const post = await postModel.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

   
    // Delete images from Cloudinary
    if (post.images && post.images.length > 0) {
      try {
        await Promise.all(
          post.images.map(async (image) => {
            await cloudinary.v2.uploader.destroy(image.public_id);
          })
        );
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Continue with DB deletion even if Cloudinary fails
      }
    }

    // Delete post from database
    await postModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });

  } catch (error) {
    console.error("Error in deletePostController:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete post",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const deletePostImage = async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const imageId = req.params.imageId;
    const image = post.images.find((img) => img.public_id === imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    await cloudinary.v2.uploader.destroy(image.public_id);
    post.images = post.images.filter((img) => img.public_id !== imageId);
    await post.save();

    return res.status(200).json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error in deletePostImage:", error);
    return res.status(500).json({ success: false, message: "Failed to delete image", error });
  }   
  
}
//UPDATE POST
const updatePostController = async (req, res) => {
  try {
    const { title, description } = req.body;
    //post find
    const post = await postModel.findById({ _id: req.params.id });
    //validation
    if (!title || !description) {
      return res.status(500).send({
        success: false,
        message: "Please Provide post title or description",
      });
    }
    const updatedPost = await postModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        title: title || post?.title,
        description: description || post?.description,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Post Updated Successfully",
      updatedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Errro in update post api",
      error,
    });
  }
};


module.exports = {
  createPostController,
  getAllPostsContoller,
  getUserPostsController,
  deletePostController,
  updatePostController,
  deletePostImage,
};
