import { Button, Card, Input, Modal } from '@/components/ui';
import { useProductStore } from '@/stores';
import type { Product } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import React, { useMemo, useState } from 'react';
import {
  FiDownload,
  FiEdit3,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiPlus,
  FiSearch,
  FiTrash2
} from 'react-icons/fi';

interface ProductFormData {
  name: string;
  price: string;
  category: string;
  description: string;
  barcode: string;
  stock: string;
  image: string;
}

interface ProductFormProps {
  formData: ProductFormData;
  formErrors: Partial<ProductFormData>;
  categories: string[];
  onInputChange: (field: keyof ProductFormData, value: string) => void;
}

const ProductForm: React.FC<ProductFormProps> = React.memo(({
  formData,
  formErrors,
  categories,
  onInputChange
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Product Name *"
        value={formData.name}
        onChange={(e) => onInputChange('name', e.target.value)}
        error={formErrors.name}
        placeholder="Enter product name"
      />
      <Input
        label="Price *"
        type="number"
        step="0.01"
        min="0"
        value={formData.price}
        onChange={(e) => onInputChange('price', e.target.value)}
        error={formErrors.price}
        placeholder="0.00"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category *
        </label>
        <select
          value={formData.category}
          onChange={(e) => onInputChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        >
          <option value="">Select category</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
          <option value="new">+ Add New Category</option>
        </select>
        {formData.category === 'new' && (
          <Input
            className="mt-2"
            placeholder="Enter new category name"
            value={formData.category === 'new' ? '' : formData.category}
            onChange={(e) => onInputChange('category', e.target.value)}
          />
        )}
        {formErrors.category && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
            {formErrors.category}
          </p>
        )}
      </div>
      <Input
        label="Stock Quantity *"
        type="number"
        min="0"
        value={formData.stock}
        onChange={(e) => onInputChange('stock', e.target.value)}
        error={formErrors.stock}
        placeholder="0"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Barcode"
        value={formData.barcode}
        onChange={(e) => onInputChange('barcode', e.target.value)}
        placeholder="Product barcode"
      />
      <Input
        label="Image URL"
        value={formData.image}
        onChange={(e) => onInputChange('image', e.target.value)}
        placeholder="https://example.com/image.jpg"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Description
      </label>
      <textarea
        value={formData.description}
        onChange={(e) => onInputChange('description', e.target.value)}
        placeholder="Product description..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
      />
    </div>
  </div>
));

export const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct
  } = useProductStore();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    category: '',
    description: '',
    barcode: '',
    stock: '',
    image: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<ProductFormData>>({});

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
      const matchesStatus = showInactive || product.isActive;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, showInactive]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      barcode: '',
      stock: '',
      image: '',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<ProductFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Valid price is required';
    }

    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      errors.stock = 'Valid stock quantity is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProduct = () => {
    if (!validateForm()) return;

    addProduct({
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      category: formData.category.trim(),
      description: formData.description.trim() || undefined,
      barcode: formData.barcode.trim() || undefined,
      stock: parseInt(formData.stock),
      image: formData.image.trim() || undefined,
      isActive: true,
    });

    resetForm();
    setIsAddModalOpen(false);
  };

  const handleEditProduct = () => {
    if (!validateForm() || !editingProduct) return;

    updateProduct(editingProduct.id, {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      category: formData.category.trim(),
      description: formData.description.trim() || undefined,
      barcode: formData.barcode.trim() || undefined,
      stock: parseInt(formData.stock),
      image: formData.image.trim() || undefined,
    });

    resetForm();
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description || '',
      barcode: product.barcode || '',
      stock: product.stock.toString(),
      image: product.image || '',
    });
    setIsEditModalOpen(true);
  };

  const toggleProductStatus = (product: Product) => {
    updateProduct(product.id, { isActive: !product.isActive });
  };

  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProduct(product.id);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Products Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your product inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            startIcon={<FiDownload />}
          >
            Export
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            startIcon={<FiPlus />}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<FiSearch className="w-5 h-5" />}
            />
          </div>
          <div className="lg:w-48">
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
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
              startIcon={showInactive ? <FiEye /> : <FiEyeOff />}
            >
              {showInactive ? 'Hide Inactive' : 'Show Inactive'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiFilter className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {product.description}
                          </div>
                        )}
                        {product.barcode && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Barcode: {product.barcode}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock <= 10
                        ? 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-200'
                        : product.stock <= 50
                          ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200'
                          : 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200'
                      }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleProductStatus(product)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isActive
                          ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(product.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="text-danger-600 hover:text-danger-900 dark:text-danger-400 dark:hover:text-danger-300"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <FiFilter className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No products found matching your criteria
            </p>
          </div>
        )}
      </Card>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          resetForm();
          setIsAddModalOpen(false);
        }}
        title="Add New Product"
        size="lg"
      >
        <ProductForm
          formData={formData}
          formErrors={formErrors}
          categories={categories}
          onInputChange={handleInputChange}
        />
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddProduct}>
            Add Product
          </Button>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          resetForm();
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        title="Edit Product"
        size="lg"
      >
        <ProductForm
          formData={formData}
          formErrors={formErrors}
          categories={categories}
          onInputChange={handleInputChange}
        />
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              setIsEditModalOpen(false);
              setEditingProduct(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleEditProduct}>
            Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
};