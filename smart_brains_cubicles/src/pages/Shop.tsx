import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import AgeFilter from '../components/AgeFilter';
import api from '../services/api';
import { Loader2, FilterX } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  minAgeMonths: number;
  maxAgeMonths: number;
}

const Shop: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialAge = searchParams.get('ageMonths') ? parseInt(searchParams.get('ageMonths') as string, 10) : null;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ageFilter, setAgeFilter] = useState<number | null>(initialAge);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const categories = ['Velcro Binders', 'Flashcards', 'Activity Books'];

  useEffect(() => {
    fetchProducts();
  }, [ageFilter, categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/products';
      const params = new URLSearchParams();
      if (ageFilter !== null) params.append('ageMonths', ageFilter.toString());
      if (categoryFilter) params.append('category', categoryFilter);
      
      const res = await api.get(`${url}?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setAgeFilter(null);
    setCategoryFilter('');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-1/4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
            {(ageFilter !== null || categoryFilter) && (
              <button 
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold transition-colors"
              >
                <FilterX size={16} /> Clear
              </button>
            )}
          </div>
          
          <AgeFilter selectedAge={ageFilter} onChange={setAgeFilter} />

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Categories</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={categoryFilter === ''}
                  onChange={() => setCategoryFilter('')}
                  className="w-5 h-5 text-primary focus:ring-primary border-gray-300"
                />
                <span className="text-gray-700 font-medium group-hover:text-primary transition-colors">All Categories</span>
              </label>
              {categories.map(cat => (
                <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={categoryFilter === cat}
                    onChange={() => setCategoryFilter(cat)}
                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-gray-700 font-medium group-hover:text-primary transition-colors">{cat}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full md:w-3/4">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight">
            Our Learning Collection
          </h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <p className="text-xl text-gray-500 font-medium">No products found matching your filters.</p>
              <button 
                onClick={clearFilters}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Clear filters to see all products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
