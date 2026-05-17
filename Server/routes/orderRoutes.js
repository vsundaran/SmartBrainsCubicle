const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protectAdmin } = require('../middlewares/authMiddleware');

// Public route to submit an order during checkout
router.post('/', createOrder);

// Admin-only routes to get and update orders
router.get('/', protectAdmin, getOrders);
router.put('/:id/status', protectAdmin, updateOrderStatus);

module.exports = router;
