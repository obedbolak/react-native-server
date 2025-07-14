const express = require("express");
const {
  registerController,
  loginController,
  updateUserController,
  passwordResetController,
profilePictureupdateController,
  requireSingIn,
} = require("../controllers/userController");
const { singleUpload } = require("../middleWare/multer");

//riouter object
const router = express.Router();

//routes

// REGISTER || POST
router.post("/register", registerController);

// LOGIN || POST
router.post("/login", loginController);

//UPDATE || PUT
router.put("/update-user", requireSingIn, updateUserController);

// password update
router.put("/password-update", passwordResetController);

//profilePictureupdate
router.put("/profile-picture-update/:id",requireSingIn, singleUpload, profilePictureupdateController);

//export
module.exports = router;
