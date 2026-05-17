import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-dark text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-secondary mb-4">
              Smart Brains Cubicle
            </h3>
            <p className="text-primary-light">
              Making Early Learning a Joyful, Screen-Free Journey
            </p>
            <p className="mt-2 text-sm">
              Celebrating 2 beautiful years of growth in Tirupur.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-secondary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/shop"
                  className="hover:text-secondary transition-colors"
                >
                  Shop
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
            <p className="text-sm">Tirupur, Tamil Nadu, India</p>
            <p className="text-sm mt-2">Email: hello@smartbrains.com</p>
            <p className="text-sm mt-2">Phone: +91 9698690899</p>
          </div>
        </div>
        <div className="border-t border-primary mt-8 pt-8 text-center text-sm text-primary-light">
          &copy; {new Date().getFullYear()} Smart Brains Cubicle. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
