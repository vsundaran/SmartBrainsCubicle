const express = require('express');
const router = express.Router();
const {
  getProducts,
  getBestSellers,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/best-sellers', getBestSellers);
router.get('/:id', getProductById);

// Protected routes (Admin only)
router.post('/', protectAdmin, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]), createProduct);
router.put('/:id', protectAdmin, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]), updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);

module.exports = router;
