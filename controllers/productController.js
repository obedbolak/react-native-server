
const productModel = require("../models/productModel.js");

const cloudinary = require("cloudinary");
const { getDataUri } = require("../utils/dataUri.js");

// GET ALL PRODUCTS
const getAllProductsController = async (req, res) => {
  const { keyword, category } = req.query;
  try {
    const products = await productModel
      .find({
        name: {
          $regex: keyword ? keyword : "",
          $options: "i",
        },
      })
      .populate("category");
    res.status(200).send({
      success: true,
      message: "All products fetched successfully",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get All Products API",
      error,
    });
  }
};

// GET TOP PRODUCT
const getTopProductsController = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ rating: -1 }).limit(4);
    res.status(200).send({
      success: true,
      message: "Top 3 products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get TOP PRODUCTS API",
      error,
    });
  }
};

// GET SINGLE PRODUCT
const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Product Found",
      product,
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in Get Single Product API",
      error,
    });
  }
};

// CREATE PRODUCT
 const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, stock, sellerId } = req.body;

    // Validation for required fields (if needed)
    if (!name || !description || !price || !stock) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Please provide product images",
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

    // Create the product in the database
    const newProduct = await productModel.create({
      name,
      description,
      price,
    //   category,
      stock,
      sellerId,
      images: imagesArray, // Save the array of image links
    });

    // Return a success response
    res.status(201).send({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in creating the product",
      error: error.message,
    });
  }
};     	    

// UPDATE PRODUCT
const updateProductController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    const { name, description, price, stock, category } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;

    await product.save();
    res.status(200).send({
      success: true,
      message: "Product details updated",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in Update Product API",
      error,
    });
  }
};

// UPDATE PRODUCT IMAGE
const updateProductImageController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    if (!req.file) {
      return res.status(404).send({
        success: false,
        message: "Product image not found",
      });
    }

    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };
    product.images.push(image);
    await product.save();
    res.status(200).send({
      success: true,
      message: "Product image updated",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in Update Product Image API",
      error,
    });
  }
};

// DELETE PRODUCT IMAGE
const deleteProductImageController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product Not Found",
      });
    }

    const id = req.query.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "Product image not found",
      });
    }

    let isExist = -1;
    product.images.forEach((item, index) => {
      if (item._id.toString() === id.toString()) isExist = index;
    });
    if (isExist < 0) {
      return res.status(404).send({
        success: false,
        message: "Image Not Found",
      });
    }

    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
    product.images.splice(isExist, 1);
    await product.save();
    return res.status(200).send({
      success: true,
      message: "Product Image Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in Delete Product Image API",
      error,
    });
  }
};

const deleteSpecificProductImageController = async (req, res) => {
  const productId = req.params.id;
  const { index } = req.body; // Get the index from the request body

  try {
    // Find the product by ID
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Validate the index
    if (index < 0 || index >= product.images.length) {
      return res.status(400).json({ success: false, message: "Invalid index" });
    }

    // If using Cloudinary, delete the image from there as well
    const publicId = product.images[index].public_id; // Assuming your image objects have a public_id field
    await cloudinary.v2.uploader.destroy(publicId);

    // Remove the image at the specified index
    product.images.splice(index, 1);
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product image deleted successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product Id" });
    }
    return res.status(500).json({
      success: false,
      message: "Error in delete product image API",
      error,
    });
  }
};

// DELETE PRODUCT
const deleteProductController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    for (let index = 0; index < product.images.length; index++) {
      await cloudinary.v2.uploader.destroy(product.images[index].public_id);
    }
    await product.deleteOne();
    res.status(200).send({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in Delete Product API",
      error,
    });
  }
};

// CREATE PRODUCT REVIEW AND COMMENT
const productReviewController = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const product = await productModel.findById(req.params.id);
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).send({
        success: false,
        message: "Product Already Reviewed",
      });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
    await product.save();
    res.status(200).send({
      success: true,
      message: "Review Added!",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in Review Comment API",
      error,
    });
  }
};

const approveProductController = async (req, res) => {
  try {
    const { productId } = req.params; // Get productId from URL parameter

    // Step 1: Find the product by ID
    const product = await productModel.findById(productId);

    // Step 2: Check if the product exists
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // Step 3: Check if the product is already approved
    if (product.isApproved === true) {
      return res.status(400).send({
        success: false,
        message: "Product is already approved",
      });
    }

    // Step 4: Update the product's approval status
    product.isApproved = true;
    await product.save(); // Save the updated product

    // Step 5: Send a success response
    res.status(200).send({
      success: true,
      message: "Product approved successfully",
      product: product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in approving the product",
      error: error.message,
    });
  }
};


const boostProduct = async (req, res) => {
  try {
    // Extract product ID and boost value from the request body
    const { productId, boostAmount } = req.body;

    // Find the product by ID
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Add the boostAmount to the current 'boosted' value
    product.boosted += boostAmount;

    // Save the updated product
    await product.save();

    // Respond with the updated product
    res.status(200).json({ message: 'Product boosted successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// ========== EXPORT CONTROLLERS ================
module.exports = {
  getAllProductsController,
  getTopProductsController,
  getSingleProductController,
  createProductController,
  updateProductController,
  updateProductImageController,
  deleteProductImageController,
  deleteProductController,
  productReviewController,
  deleteSpecificProductImageController,
  approveProductController,
   boostProduct,
};