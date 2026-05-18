import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AgeFilter from "../components/AgeFilter";
import { BookOpen, ShieldCheck, Heart, ArrowRight, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { API_URL } from "../env";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  stock: number;
}

const Home: React.FC = () => {
  const [age, setAge] = useState<number>(12);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products/best-sellers?limit=8");
        if (res.data.success) {
          setProducts(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      const targetScroll =
        direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* CSS injection to hide horizontal scrollbar cleanly across browsers */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Hero Section */}
      <section className="bg-primary-light/10 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary-dark mb-6 tracking-tight">
            Making Early Learning a Joyful, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary relative inline-block drop-shadow-sm font-black">
              Screen-Free Journey
              <span className="absolute -bottom-1 left-0 w-full h-3 bg-secondary/30 -z-10 rounded-full"></span>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 font-medium">
            Celebrating 2 beautiful years of nurturing young minds in Tirupur.
            Discover our handcrafted, Montessori-aligned educational materials.
          </p>

          <div className="max-w-md mx-auto">
            <AgeFilter
              selectedAge={age}
              onChange={setAge}
              autoNavigate={true}
            />
          </div>
        </div>
      </section>

      {/* Horizontal Best Sellers Section */}
      <section className="py-20 px-4 bg-gray-50/50 relative overflow-hidden">
        {/* Decorative background blur objects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-light/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary-dark/60 bg-primary-light/15 px-3 py-1.5 rounded-full mb-3 inline-block">
                Tirupur's Favorite
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Our Best Sellers
              </h2>
              <p className="text-gray-500 font-medium mt-1">
                Carefully crafted, Montessori-aligned educational materials for early developmental milestones.
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
              <Link
                to="/shop"
                className="group flex items-center space-x-2 text-primary font-bold hover:text-primary-dark transition-colors mr-4"
              >
                <span>Explore Shop</span>
                <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
              </Link>

              {products.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => scroll("left")}
                    className="p-3 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 text-gray-600 active:scale-95 transition-all"
                    aria-label="Scroll Left"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => scroll("right")}
                    className="p-3 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 text-gray-600 active:scale-95 transition-all"
                    aria-label="Scroll Right"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex space-x-6 overflow-hidden py-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-[280px] sm:w-[320px] flex-shrink-0 bg-white rounded-2xl p-4 border border-gray-100 animate-pulse space-y-4"
                >
                  <div className="aspect-square bg-gray-100 rounded-xl w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-gray-100 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-100 rounded-lg w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <p className="text-gray-500 font-medium">No best selling products available right now.</p>
              <Link to="/shop" className="mt-4 inline-block bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl transition-all">
                Browse Shop
              </Link>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex space-x-6 overflow-x-auto pb-6 pt-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
            >
              {products.map((product) => (
                <div
                  key={product._id}
                  className="w-[280px] sm:w-[320px] flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col justify-between"
                >
                  {/* Card Image */}
                  <div 
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="cursor-pointer overflow-hidden aspect-square relative bg-gray-50 border-b border-gray-50"
                  >
                    <img
                      src={
                        product.images && product.images.length > 0
                          ? (product.images[0].startsWith('http') ? product.images[0] : `${API_URL}${product.images[0]}`)
                          : "https://via.placeholder.com/400x400?text=No+Image"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    
                    {/* Age Badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-primary-dark font-extrabold text-xs px-3 py-1.5 rounded-full shadow-sm">
                      {product.minAgeMonths}m - {product.maxAgeMonths}m
                    </div>

                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Card Info */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-dark/80 bg-secondary/10 px-2.5 py-1 rounded-md mb-2 inline-block">
                        {product.category}
                      </span>
                      <h3 
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-primary transition-colors cursor-pointer line-clamp-1 leading-snug"
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-50">
                      <span className="text-lg font-black text-gray-900">
                        ₹{product.price}
                      </span>

                      <button
                        onClick={() => addToCart(product)}
                        className="bg-primary/10 hover:bg-primary text-primary hover:text-white p-2.5 rounded-xl transition-all duration-300 active:scale-95 group/btn animate-pulse hover:animate-none"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag size={18} className="transform group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* "View All" End-Card */}
              <div 
                onClick={() => navigate('/shop')}
                className="w-[200px] sm:w-[240px] flex-shrink-0 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-dashed border-primary/20 hover:border-primary/40 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all mb-4">
                  <ArrowRight size={22} className="transform group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h3 className="font-extrabold text-gray-900 group-hover:text-primary transition-colors">View All Products</h3>
                <p className="text-xs text-gray-500 mt-1">Explore our full catalog of screen-free materials</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center text-secondary-dark mb-6 shadow-sm">
                <Heart size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                100% Screen-Free
              </h3>
              <p className="text-gray-600">
                Protecting little eyes and promoting active, hands-on learning
                experiences away from digital devices.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 shadow-sm">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Toddler-Proof & Reusable
              </h3>
              <p className="text-gray-600">
                Durable materials designed to withstand enthusiastic little
                hands, completely reusable for endless fun.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                <BookOpen size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Montessori Aligned
              </h3>
              <p className="text-gray-600">
                Carefully structured activities that respect your child's
                natural psychological and physical development.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
