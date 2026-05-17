import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { useAlertConfirm } from '../context/AlertConfirmContext';
import { ChevronLeft, ShoppingBag, Send, CheckCircle2, Loader2 } from 'lucide-react';

interface CheckoutForm {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const { showAlert } = useAlertConfirm();
  const [loading, setLoading] = useState<boolean>(false);
  const [orderCreated, setOrderCreated] = useState<boolean>(false);
  const [createdOrderData, setCreatedOrderData] = useState<any>(null);

  const [form, setForm] = useState<CheckoutForm>({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});

  const validate = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {};
    if (!form.customerName.trim()) newErrors.customerName = 'Name is required';
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(form.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!form.address.trim()) newErrors.address = 'Street address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.zipCode.trim()) {
      newErrors.zipCode = 'ZIP Code is required';
    } else if (!/^[0-9]{5,6}$/.test(form.zipCode.trim())) {
      newErrors.zipCode = 'Enter a valid 5-6 digit ZIP Code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof CheckoutForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const triggerWhatsAppRedirect = (order: any) => {
    const phoneNumber = '919698690899';
    
    // Format order items list with safe rupee character sequence
    const itemsSummary = order.items
      .map((item: any) => `• *${item.name}* (Qty: ${item.quantity}) - \u20B9${item.price * item.quantity}`)
      .join('\n');

    // Build the descriptive WhatsApp message using robust Plane 0 Unicode symbols
    const messageText = 
`Hello Smart Brains Cubicle!

I would like to place an order. Here are my details:

\u2726 *Order Details:*
*Order ID:* \`${order._id}\`
*Status:* Initiated

\u2726 *Customer Info:*
*Name:* ${order.customerName}
*Phone:* ${order.phone}
*Email:* ${order.email}

\u2726 *Shipping Address:*
${order.address},
${order.city}, ${order.state} - ${order.zipCode}

\u2726 *Ordered Products:*
${itemsSummary}

\u2726 *Total Amount:* \u20B9${order.totalAmount}

Please verify my order and send over your payment instructions (GPay / Bank Transfer). Thank you!`;

    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    
    // Attempt automatic redirect
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      // Map frontend cart items to backend format
      const backendItems = items.map(item => ({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const payload = {
        customerName: form.customerName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        items: backendItems,
        totalAmount: cartTotal
      };

      const res = await api.post('/orders', payload);

      if (res.data.success) {
        const orderData = res.data.data;
        setCreatedOrderData(orderData);
        setOrderCreated(true);
        
        // Open WhatsApp in new window
        triggerWhatsAppRedirect(orderData);
        
        // Empty the shopping cart
        clearCart();
      }
    } catch (error: any) {
      console.error('Order creation failed', error);
      await showAlert('Checkout Error', error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Success Screen View
  if (orderCreated && createdOrderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 border border-green-200 text-green-500 mb-6">
            <CheckCircle2 size={40} className="animate-bounce" />
          </div>
          
          <h2 className="text-3xl font-brand font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-3">
            Order Placed!
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed font-medium">
            Your order record has been successfully initiated in our system. 
            To complete your payment and confirm the shipment, please message our Parent Consultant on WhatsApp.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100">
            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Order Identifier</div>
            <div className="text-sm font-mono font-bold text-gray-800 break-all select-all">{createdOrderData._id}</div>
            
            <div className="text-xs font-bold text-gray-400 uppercase mt-3 mb-1">Total Billing</div>
            <div className="text-lg font-black text-primary-dark">₹{createdOrderData.totalAmount}</div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => triggerWhatsAppRedirect(createdOrderData)}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white text-lg font-bold py-4 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <Send size={20} />
              <span>Connect on WhatsApp</span>
            </button>

            <Link
              to="/"
              className="block w-full text-center text-gray-500 hover:text-primary py-2 font-semibold transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty Cart View
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6 border border-gray-200">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-3">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm text-center font-medium">
          Add some handcrafted educational learning materials before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <Link to="/shop" className="text-gray-500 hover:text-primary mb-8 inline-flex items-center font-medium transition-colors">
          <ChevronLeft size={20} className="mr-1" /> Continue Shopping
        </Link>

        <h1 className="text-3xl font-brand font-black text-gray-900 mb-8">Checkout Information</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-50 pb-3">Shipping Address</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full border ${errors.customerName ? 'border-red-500 bg-red-50/20' : 'border-gray-300'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow`}
                />
                {errors.customerName && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.customerName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className={`w-full border ${errors.email ? 'border-red-500 bg-red-50/20' : 'border-gray-300'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number (WhatsApp Preferred)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full border ${errors.phone ? 'border-red-500 bg-red-50/20' : 'border-gray-300'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House/Apartment/Building Number, Street Name"
                  rows={2}
                  className={`w-full border ${errors.address ? 'border-red-500 bg-red-50/20' : 'border-gray-300'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow`}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={`w-full border ${errors.city ? 'border-red-500 bg-red-50/20' : 'border-gray-300'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow`}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                    className={`w-full border ${errors.state ? 'border-red-500 bg-red-50/20' : 'border-gray-300'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow`}
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleChange}
                    placeholder="Pincode"
                    className={`w-full border ${errors.zipCode ? 'border-red-500 bg-red-50/20' : 'border-gray-300'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow`}
                  />
                  {errors.zipCode && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.zipCode}</p>}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-extrabold text-lg py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-75 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={22} />
                      <span>Creating Order...</span>
                    </>
                  ) : (
                    <>
                      <Send size={22} />
                      <span>Proceed to Pay</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-50 pb-3">Order Summary</h2>
            
            <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto pr-2 space-y-4 mb-6">
              {items.map(item => (
                <div key={item._id} className="flex items-center py-3 first:pt-0 last:pb-0">
                  <div className="h-16 w-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                    <img
                      src={item.image || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">Quantity: {item.quantity}</p>
                    <p className="text-sm font-extrabold text-primary-dark mt-1">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-3">
              <div className="flex justify-between text-sm font-medium text-gray-500">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-500">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">Free</span>
              </div>
              
              <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-800">Total Amount</span>
                <span className="text-2xl font-black text-primary-dark">₹{cartTotal}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
