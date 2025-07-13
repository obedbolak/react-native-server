const express = require("express");
const { requireSingIn } = require("../controllers/userController");
const {
  createPostController,
  getAllPostsContoller,
  getUserPostsController,
  deletePostController,
  updatePostController,
  deletePostImage,
} = require("../controllers/postController");
const { multipleUpload, singleUpload } = require("../middleWare/multer.js");

//router object
const router = express.Router();

// CREATE POST || POST
router.post("/create-post" , requireSingIn, multipleUpload, createPostController);

//GET ALL POSTs
router.get("/get-all-post", getAllPostsContoller);

//GET USER POSTs
router.get("/get-user-post", requireSingIn, getUserPostsController);

//DELEET POST
router.delete("/delete-post/:id", requireSingIn, deletePostController);

//delete single post image
router.delete("/delete-post-image/:id/:imageId", deletePostImage);

//UPDATE POST
router.put("/update-post/:id",  updatePostController);

//export
module.exports = router;
