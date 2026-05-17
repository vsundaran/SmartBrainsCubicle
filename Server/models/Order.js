const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true
  },
  phone: { 
    type: String, 
    required: true,
    trim: true
  },
  address: { 
    type: String, 
    required: true,
    trim: true
  },
  city: { 
    type: String, 
    required: true,
    trim: true
  },
  state: { 
    type: String, 
    required: true,
    trim: true
  },
  zipCode: { 
    type: String, 
    required: true,
    trim: true
  },
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 1
    }
  }],
  totalAmount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Initiated', 'Confirmed', 'Dispatched', 'Received', 'Returned'], 
    default: 'Initiated' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
