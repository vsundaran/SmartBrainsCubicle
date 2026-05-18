import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { ShoppingCart, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { API_URL } from "../env";

interface Product {
  _id: string;
  name: string;
  description: string;
  longDescription: string;
  contents: string;
  materials: string;
  price: number;
  category: string;
  images: string[];
  minAgeMonths: number;
  maxAgeMonths: number;
  stock: number;
  videoUrl?: string;
}

const getInstagramEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const regex = /(?:instagram\.com\/(?:reel|p)\/)([a-zA-Z0-9_-]+)/i;
  const match = url.match(regex);
  if (match && match[1]) {
    return `https://www.instagram.com/reel/${match[1]}/embed/`;
  }
  return null;
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [mainImage, setMainImage] = useState<string>("");
  const { addToCart } = useCart();

  const handleBuyNow = () => {
    if (product) {
      addToCart(product);
      navigate("/checkout");
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
          if (res.data.data.images && res.data.data.images.length > 0) {
            setMainImage(res.data.data.images[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={64} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Product Not Found
        </h2>
        <Link
          to="/shop"
          className="text-primary hover:underline font-semibold flex items-center"
        >
          <ChevronLeft size={20} /> Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/shop"
          className="text-gray-500 hover:text-primary mb-8 inline-flex items-center font-medium transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" /> Back to Collection
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4 md:sticky md:top-28 md:self-start">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
              <img
                src={
                  mainImage
                    ? (mainImage.startsWith('http') ? mainImage : `${API_URL}${mainImage}`)
                    : "https://via.placeholder.com/600x600?text=No+Image"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? "border-primary shadow-md scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img
                      src={img.startsWith('http') ? img : `${API_URL}${img}`}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Video Section */}
            {product.videoUrl && (
              <div className="mt-8 bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="font-brand font-black">See it in Action!</span>
                </h3>
                <div className="relative w-full aspect-[9/16] max-w-[280px] mx-auto rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-black flex items-center justify-center">
                  {getInstagramEmbedUrl(product.videoUrl) ? (
                    <iframe
                      src={getInstagramEmbedUrl(product.videoUrl)!}
                      className="absolute inset-0 w-full h-full border-0"
                      allowFullScreen
                      scrolling="no"
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    ></iframe>
                  ) : (
                    <video
                      src={product.videoUrl.startsWith('http') ? product.videoUrl : `${API_URL}${product.videoUrl}`}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    ></video>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <p className="text-sm text-primary-light font-bold tracking-wider uppercase mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="text-3xl font-black text-primary-dark mb-6">
              ₹{product.price}
            </div>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="mb-8">
              <div className="flex items-center space-x-2 text-green-600 font-semibold mb-4 bg-green-50 w-max px-4 py-2 rounded-full border border-green-100">
                <CheckCircle2 size={20} />
                <span>In Stock ({product.stock} available)</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <button
                  onClick={() => addToCart(product)}
                  className="bg-white hover:bg-gray-50 text-primary border-2 border-primary text-lg font-bold py-4 px-8 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center space-x-3 md:min-w-[200px]"
                >
                  <ShoppingCart size={24} />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white text-lg font-extrabold py-4 px-10 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center space-x-3 md:min-w-[200px]"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Product Details Sections */}
            <div className="mt-8 space-y-12 border-t border-gray-200 pt-8">
              <div className="prose prose-lg text-gray-600 max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                  Details
                </h3>
                <div className="whitespace-pre-line">
                  {product.longDescription}
                </div>
              </div>

              <div className="prose prose-lg text-gray-600 max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                  What's Inside
                </h3>
                <div className="whitespace-pre-line">{product.contents}</div>
              </div>

              <div className="prose prose-lg text-gray-600 max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                  Safety & Materials
                </h3>
                <div className="whitespace-pre-line">{product.materials}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
