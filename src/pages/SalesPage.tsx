import React, { useState, useMemo } from 'react';
import { FiSearch, FiShoppingCart, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useProductStore, useCartStore, useSettingsStore } from '@/stores';
import { Button, Input, Card } from '@/components/ui';
import { formatCurrency } from '@/utils';
import { PaymentModal } from '@/components/PaymentModal';

export const SalesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { products, setSearchTerm: setStoreSearchTerm, setSelectedCategory: setStoreSelectedCategory, getFilteredProducts } = useProductStore();
  const { items, addItem, removeItem, updateQuantity, clearCart, getSubtotal, getTax, getTotal } = useCartStore();
  const { settings } = useSettingsStore();

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  // Update store search term when local search changes
  React.useEffect(() => {
    setStoreSearchTerm(searchTerm);
  }, [searchTerm, setStoreSearchTerm]);

  React.useEffect(() => {
    setStoreSelectedCategory(selectedCategory);
  }, [selectedCategory, setStoreSelectedCategory]);

  const filteredProducts = getFilteredProducts();
  const subtotal = getSubtotal();
  const tax = getTax(settings.taxRate);
  const total = getTotal(settings.taxRate);

  const handlePayment = () => {
    if (items.length > 0) {
      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentComplete = () => {
    clearCart();
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Products Section */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Point of Sale
          </h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startIcon={<FiSearch className="w-5 h-5" />}
              />
            </div>
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map(product => (
            <Card
              key={product.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-md"
              onClick={() => addItem(product)}
              padding="sm"
            >
              <div className="aspect-square mb-2 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiShoppingCart className="w-8 h-8" />
                  </div>
                )}
              </div>
              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-primary-600 dark:text-primary-400 font-semibold">
                {formatCurrency(product.price)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Stock: {product.stock}
              </p>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <FiShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No products found matching your criteria
            </p>
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="lg:w-80">
        <Card className="sticky top-4">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <FiShoppingCart className="w-5 h-5 mr-2" />
              Cart ({items.length})
            </h2>
          </div>

          {/* Cart Items */}
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} className="flex items-center space-x-3 py-2">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FiShoppingCart className="w-4 h-4" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(item.price)}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1 rounded text-gray-400 hover:text-danger-600 dark:hover:text-danger-400"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-8">
              <FiShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Your cart is empty
              </p>
            </div>
          )}

          {/* Cart Summary */}
          {items.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax ({(settings.taxRate * 100).toFixed(1)}%):</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-gray-900 dark:text-gray-100">Total:</span>
                  <span className="text-primary-600 dark:text-primary-400">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Button
                  onClick={handlePayment}
                  className="w-full"
                  size="lg"
                >
                  Process Payment
                </Button>
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="w-full"
                >
                  Clear Cart
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentComplete={handlePaymentComplete}
        cartItems={items}
        subtotal={subtotal}
        tax={tax}
        total={total}
        taxRate={settings.taxRate}
      />
    </div>
  );
};