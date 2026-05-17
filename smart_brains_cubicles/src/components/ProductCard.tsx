import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  minAgeMonths: number;
  maxAgeMonths: number;
}

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useCart();
  
  const imageUrl = product.images.length > 0 
    ? `http://localhost:5001${product.images[0]}`
    : 'https://via.placeholder.com/300x300?text=No+Image';

  const formatAge = (months: number) => {
    if (months === 0) return '0m';
    if (months < 12) return `${months}m`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return remMonths > 0 ? `${years}y ${remMonths}m` : `${years}y`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
      <Link to={`/product/${product._id}`} className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-secondary text-primary-dark text-xs font-bold px-2 py-1 rounded-full shadow-sm">
          {formatAge(product.minAgeMonths)} - {formatAge(product.maxAgeMonths)}
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <p className="text-sm text-primary-light font-semibold mb-1">{product.category}</p>
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xl font-black text-primary-dark">₹{product.price}</span>
          <button 
            onClick={() => addToCart(product)}
            className="bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-colors shadow-sm hover:shadow active:scale-95" 
            aria-label="Add to Cart"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
