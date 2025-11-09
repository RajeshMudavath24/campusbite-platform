import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, Clock, Search } from 'lucide-react';
import { categories } from '../data/dummyData';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { seedMenuItems, checkMenuItems } from '../utils/seedMenu';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const { user } = useAuth();
  const { addToCart } = useCart();

  const loadMenuItems = async () => {
    setLoading(true);
    
    // Check if menu items exist, if not, seed them
    const hasMenuItems = await checkMenuItems();
    if (!hasMenuItems) {
      console.log('No menu items found, seeding...');
      await seedMenuItems();
    }
    
    const unsub = onSnapshot(collection(db, 'menu'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMenuItems(items);
      setLoading(false);
    }, (e) => {
      console.error('Error loading menu items:', e);
      setLoading(false);
    });
    return unsub;
  };

  const filterItems = useCallback(() => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [menuItems, selectedCategory, searchTerm]);

  useEffect(() => {
    let unsub;
    const setupMenuItems = async () => {
      unsub = await loadMenuItems();
    };
    setupMenuItems();
    
    return () => {
      if (unsub && typeof unsub === 'function') {
        unsub();
      }
    };
  }, []);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  const handleQuantityChange = (itemId, change) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const handleAddToCart = async (item) => {
    const quantity = quantities[item.id] || 1;
    if (quantity === 0) return;

    try {
      await addToCart(item, quantity);
      // Reset quantity after adding to cart
      setQuantities(prev => ({ ...prev, [item.id]: 0 }));
      alert(`${item.name} has been added to your cart!`); // Simple feedback
    } catch (e) {
      console.error('Add to cart error', e);
      alert('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h1>
        <p className="text-gray-600">Delicious meals prepared fresh daily</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="card hover:shadow-lg transition-shadow duration-300">
            {/* Image */}
            <div className="relative mb-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300/f3f4f6/6b7280?text=No+Image';
                }}
              />
              {item.isAvailable === false && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <span className="text-white font-medium">Unavailable</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{item.preparationTime} min</span>
                </div>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(item.price)}
                </span>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    disabled={item.isAvailable === false || (quantities[item.id] || 0) <= 0}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">
                    {quantities[item.id] || 0}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    disabled={item.isAvailable === false}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.isAvailable === false || (quantities[item.id] || 0) <= 0}
                  size="sm"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Cart Summary placeholder removed as cart is now in Firestore */}
    </div>
  );
};

export default MenuPage;