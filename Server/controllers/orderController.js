const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create a new order and decrement product stocks
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      items,
      totalAmount
    } = req.body;

    if (!customerName || !email || !phone || !address || !city || !state || !zipCode || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Please provide all required checkout details.' });
    }

    // Process stock updates for each item
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        // Decrement stock (don't go below 0)
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    const order = new Order({
      customerName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      items,
      totalAmount,
      status: 'Initiated'
    });

    const createdOrder = await order.save();
    res.status(201).json({ success: true, message: 'Order created successfully', data: createdOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders sorted by date
// @route   GET /api/orders
// @access  Admin Only
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin Only
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Initiated', 'Confirmed', 'Dispatched', 'Received', 'Returned'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status value.' });
    }

    const order = await Order.findById(req.params.id);
 
     if (order) {
       order.status = status;
       const updatedOrder = await order.save();
       res.json({ success: true, message: `Order status updated to ${status}`, data: updatedOrder });
     } else {
       res.status(404).json({ success: false, message: 'Order not found' });
     }
   } catch (error) {
     res.status(400).json({ success: false, message: error.message });
   }
 };
 
 // @desc    Delete order
 // @route   DELETE /api/orders/:id
 // @access  Admin Only
 const deleteOrder = async (req, res) => {
   try {
     const order = await Order.findById(req.params.id);
 
     if (order) {
       await order.deleteOne();
       res.json({ success: true, message: 'Order removed' });
     } else {
       res.status(404).json({ success: false, message: 'Order not found' });
     }
   } catch (error) {
     res.status(500).json({ success: false, message: error.message });
   }
 };
 
 module.exports = {
   createOrder,
   getOrders,
   updateOrderStatus,
   deleteOrder
 };
