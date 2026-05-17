const Product = require('../models/Product');
const Order = require('../models/Order');
const fs = require('fs');
const path = require('path');

const getProducts = async (req, res) => {
  try {
    const { category, ageMonths } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (ageMonths) {
      query.minAgeMonths = { $lte: Number(ageMonths) };
      query.maxAgeMonths = { $gte: Number(ageMonths) };
    }

    const products = await Product.find(query);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBestSellers = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;

    // Aggregate orders to sum quantity sold for each product
    const bestSellers = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit }
    ]);

    const bestProductIds = bestSellers.map(item => item._id);

    // Fetch details for these top-selling products
    let products = await Product.find({ _id: { $in: bestProductIds } });

    // Sort the fetched products to match their best-seller sales rank
    const productsMap = {};
    products.forEach(p => {
      productsMap[p._id.toString()] = p;
    });

    let orderedProducts = [];
    bestProductIds.forEach(id => {
      const pStr = id.toString();
      if (productsMap[pStr]) {
        orderedProducts.push(productsMap[pStr]);
      }
    });

    // Fallback: If we have fewer than `limit` top sellers, backfill with general catalog items
    if (orderedProducts.length < limit) {
      const backfillCount = limit - orderedProducts.length;
      const backfillProducts = await Product.find({
        _id: { $nin: orderedProducts.map(p => p._id) }
      }).limit(backfillCount);

      orderedProducts = [...orderedProducts, ...backfillProducts];
    }

    res.json({ success: true, data: orderedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json({ success: true, data: product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name, description, longDescription, contents, materials,
      price, category, minAgeMonths, maxAgeMonths, stock, videoUrl
    } = req.body;

    const images = req.files && req.files['images'] 
      ? req.files['images'].map(file => `/uploads/${file.filename}`) 
      : [];

    let finalVideoUrl = videoUrl || '';
    if (req.files && req.files['video'] && req.files['video'].length > 0) {
      finalVideoUrl = `/uploads/${req.files['video'][0].filename}`;
    }

    const product = new Product({
      name, description, longDescription, contents, materials,
      price, category, minAgeMonths, maxAgeMonths, stock, images, 
      videoUrl: finalVideoUrl
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, data: createdProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      name, description, longDescription, contents, materials,
      price, category, minAgeMonths, maxAgeMonths, stock,
      existingImages, videoUrl
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.longDescription = longDescription || product.longDescription;
      product.contents = contents || product.contents;
      product.materials = materials || product.materials;
      product.price = price || product.price;
      product.category = category || product.category;
      product.minAgeMonths = minAgeMonths || product.minAgeMonths;
      product.maxAgeMonths = maxAgeMonths || product.maxAgeMonths;
      product.stock = stock !== undefined ? stock : product.stock;

      // Parse existing images array which might be sent from frontend
      let finalImages = [];
      if (existingImages) {
        finalImages = Array.isArray(existingImages) ? existingImages : [existingImages];
      }

      // Add new uploaded images
      if (req.files && req.files['images'] && req.files['images'].length > 0) {
        const newImages = req.files['images'].map(file => `/uploads/${file.filename}`);
        finalImages = [...finalImages, ...newImages];
      }

      product.images = finalImages;

      // Update video URL (either uploaded file or contractual input link)
      if (req.files && req.files['video'] && req.files['video'].length > 0) {
        product.videoUrl = `/uploads/${req.files['video'][0].filename}`;
      } else if (videoUrl !== undefined) {
        product.videoUrl = videoUrl;
      }

      const updatedProduct = await product.save();
      res.json({ success: true, data: updatedProduct });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Optional: Delete images from filesystem
      /*
      if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
          const filepath = path.join(__dirname, '..', 'public', img);
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
        });
      }
      */
      await product.deleteOne();
      res.json({ success: true, message: 'Product removed' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getBestSellers,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
