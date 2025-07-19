const express = require("express");
const {
  registerController,
  loginController,
  updateUserController,
  passwordResetController,
profilePictureupdateController,
  patchUserdetailsController,
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

//GET USER
router.patch("/patch-user", requireSingIn, patchUserdetailsController);

// password update
router.put("/password-update", passwordResetController);

//profilePictureupdate
router.put("/profile-picture-update/:id",requireSingIn, singleUpload, profilePictureupdateController);

//export
module.exports = router;
