const JWT = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../middleWare/authHelper.js");
const userModel = require("../models/userModel.js");
const { expressjwt: jwt } = require("express-jwt");
const cloudinary = require("cloudinary").v2;
const { getDataUri } = require("../utils/dataUri.js");

//middleware
const requireSingIn = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

//register
const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "name is required",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "email is required",
      });
    }
    if (!password || password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "password is required and 6 character long",
      });
    }
    //exisiting user
    const exisitingUser = await userModel.findOne({ email });
    if (exisitingUser) {
      return res.status(500).send({
        success: false,
        message: "User Already Register With This EMail",
      });
    }
    //hashed pasword
    const hashedPassword = await hashPassword(password);

    //save user
    const user = await userModel({
      name,
      email,
      password: hashedPassword,
    }).save();

    return res.status(201).send({
      success: true,
      message: "Registeration Successfull please login",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Register API",
      error,
    });
  }
};

//login
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please Provide Email Or Password",
      });
    }
    // find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(500).send({
        success: false,
        message: "User Not Found",
      });
    }
    //match password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(500).send({
        success: false,
        message: "Invalid usrname or password",
      });
    }
    //TOKEN JWT
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // undeinfed password
    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "login successfully",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "error in login api",
      error,
    });
  }
};

//update user
const updateUserController = async (req, res) => {
  try {
    const { name, password, email } = req.body;
    //user find
    const user = await userModel.findOne({ email });
    //password validate
    if (password && password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password is required and should be 6 character long",
      });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    //updated useer
    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      {
        name: name || user.name,
        password: hashedPassword || user.password,
      },
      { new: true }
    );
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Profile Updated Please Login",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In User Update Api",
      error,
    });
  }
};

const passwordResetController = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    // Validation
    if (!email || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Email and new password are required",
      });
    }
    
    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User Not Found",
      });
    }
    
    // Check if password is same as old password
    if (user.password) { // Ensure user.password exists
      const match = await comparePassword(newPassword, user.password);
      if (match) {
        return res.status(400).send({
          success: false,
          message: "New Password cannot be same as old password",
        });
      }
    }
    
    // Hash and save new password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
    
    return res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
    
  } catch (error) {
    console.error("Error in password reset:", error);
    return res.status(500).send({
      success: false,
      message: "Error in password reset",
      error: error.message,
    });
  }
};

const profilePictureupdateController = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: "Please upload a profile picture",
      });
    }

    // Get user ID from params
    const userId = req.params.id.trim();

    // Find the user first to check for existing profile picture
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Delete old image if exists
    if (user.profilePic && user.profilePic.public_id) {
      try {
        await cloudinary.uploader.destroy(user.profilePic.public_id);
      } catch (cloudinaryErr) {
        console.error("Error deleting old image from Cloudinary:", cloudinaryErr);
        // Continue with upload even if deletion fails
      }
    }

    // Get file data URI
    const fileUri = getDataUri(req.file);
    
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
      folder: "profile-pictures",
    });

    // Update user profile picture
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        profilePic: {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url
        }
      },
      { new: true }
    );

    // Remove sensitive data before sending response
    updatedUser.password = undefined;

    return res.status(200).send({
      success: true,
      message: "Profile picture updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Error in profile picture update:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).send({
        success: false,
        message: "Invalid user ID format",
      });
    }
    
    return res.status(500).send({
      success: false,
      message: "Error updating profile picture",
      error: error.message,
    });
  }
};
module.exports = {
  requireSingIn,
  registerController,
  loginController,
  updateUserController,
  passwordResetController,
  profilePictureupdateController,
};
