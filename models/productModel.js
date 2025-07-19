const mongoose = require("mongoose"); // Correctly require mongoose

// REVIEW SCHEMA
const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "user is required"],
    },
  },
  { timestamps: true }
);

// PRODUCT SCHEMA
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "product name is required"],
    },
  
    description: {
      type: String,
      required: [true, "product description is required"],
    },
    price: {
      type: Number,
      required: [true, "product price is required"],
    },
    stock: {
      type: Number,
      required: [true, "product stock is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
isApproved: {
      type: Boolean,
      default: false,  // default to false if not explicitly set
    },
     boosted: {
      type: Number,
      default: 0,
    },

  },
 
  { timestamps: true }
);

const productModel = mongoose.model("Products", productSchema);

// Using CommonJS export
module.exports = productModel;