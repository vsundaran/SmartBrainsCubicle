import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useAlertConfirm } from "../context/AlertConfirmContext";
import logo from "../assets/smart_brains_cubicle.jpg";

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { cartCount, toggleCart } = useCart();
  const { showConfirm } = useAlertConfirm();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoutClick = async () => {
    const confirmed = await showConfirm(
      "Sign Out",
      "Are you sure you want to log out of the admin panel?",
    );
    if (confirmed) {
      logout();
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo & Brand Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src={logo}
                alt="Smart Brains Cubicle Logo"
                className="h-12 w-auto sm:h-14 rounded-full object-cover"
              />
              <span className="font-black text-lg sm:text-2xl tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-sm flex items-baseline">
                Smart Brains Cubicle
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Link Group */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-600 hover:text-primary-dark font-semibold transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-gray-600 hover:text-primary-dark font-semibold transition-colors"
            >
              Shop
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="text-primary-dark font-bold hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="text-red-500 hover:text-red-700 font-semibold transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <User size={20} />
              </Link>
            )}
            <button
              onClick={toggleCart}
              className="relative text-gray-600 hover:text-primary transition-colors"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-secondary text-primary-dark text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Quick-Actions Header Icons */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={toggleCart}
              className="relative text-gray-600 hover:text-primary transition-colors"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-secondary text-primary-dark text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary transition-colors focus:outline-none p-1.5 hover:bg-gray-50 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Smooth Mobile Top Dropdown Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0 z-40 transition-all duration-300 ease-in-out">
          <div className="px-6 py-6 space-y-4 flex flex-col">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-700 hover:text-primary-dark font-extrabold text-lg py-2.5 border-b border-gray-50 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-700 hover:text-primary-dark font-extrabold text-lg py-2.5 border-b border-gray-50 transition-colors"
            >
              Shop
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-primary-dark font-extrabold text-lg py-2.5 border-b border-gray-50 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="text-left text-red-500 hover:text-red-700 font-extrabold text-lg py-2.5 border-b border-gray-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-primary font-extrabold text-lg py-2.5 border-b border-gray-50 flex items-center space-x-2 transition-colors"
              >
                <User size={20} />
                <span>Admin Login</span>
              </Link>
            )}

            <button
              onClick={() => {
                toggleCart();
                setIsMenuOpen(false);
              }}
              className="w-full text-left bg-primary/10 hover:bg-primary/20 text-primary-dark font-extrabold text-base py-3.5 px-5 rounded-xl flex items-center justify-between transition-all mt-4 shadow-sm"
            >
              <span className="flex items-center space-x-2">
                <ShoppingBag size={20} />
                <span>Open Cart Drawer</span>
              </span>
              {cartCount > 0 && (
                <span className="bg-secondary text-primary-dark text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
