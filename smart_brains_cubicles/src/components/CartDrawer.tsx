import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';


const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { items, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useCart();

  const handleProceedToCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[70] transition-opacity"
        onClick={toggleCart}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-[80] flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="text-primary-dark" size={24} />
            <h2 className="text-xl font-extrabold text-gray-900">Your Cart</h2>
          </div>
          <button 
            onClick={toggleCart}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                <ShoppingBag size={48} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Your cart is empty</h3>
              <p className="text-gray-500">Looks like you haven't added anything yet.</p>
              <button 
                onClick={toggleCart}
                className="mt-4 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <div key={item._id} className="flex space-x-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded-xl border border-gray-100 shadow-sm"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 line-clamp-2 leading-tight">{item.name}</h4>
                      <p className="text-primary-dark font-black mt-1">₹{item.price}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-l-lg transition-colors"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="px-3 py-1 font-bold text-sm min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-r-lg transition-colors"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-medium text-gray-600">Subtotal</span>
              <span className="text-2xl font-black text-gray-900">₹{cartTotal}</span>
            </div>
            <button 
              onClick={handleProceedToCheckout}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-lg py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              Proceed to Checkout
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">
              Shipping and taxes calculated at checkout.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
