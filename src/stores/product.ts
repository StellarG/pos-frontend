import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductState, Product } from '@/types';
import { generateId } from '@/utils';

// Mock data for development
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Coffee - Americano',
    price: 3.50,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=300&h=200&fit=crop&crop=center',
    description: 'Rich and bold americano coffee',
    stock: 50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Sandwich - Club',
    price: 8.99,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=300&h=200&fit=crop&crop=center',
    description: 'Delicious club sandwich with turkey and bacon',
    stock: 30,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Muffin - Blueberry',
    price: 2.99,
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1507066274042-8f0b7c2c0e2f?w=300&h=200&fit=crop&crop=center',
    description: 'Fresh baked blueberry muffin',
    stock: 25,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Tea - Green',
    price: 2.75,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop&crop=center',
    description: 'Premium green tea',
    stock: 40,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: mockProducts,
      searchTerm: '',
      selectedCategory: '',
      
      setProducts: (products: Product[]) => {
        set({ products });
      },
      
      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set({ products: [...get().products, newProduct] });
      },
      
      updateProduct: (id: string, updates: Partial<Product>) => {
        set({
          products: get().products.map(product =>
            product.id === id
              ? { ...product, ...updates, updatedAt: new Date() }
              : product
          )
        });
      },
      
      deleteProduct: (id: string) => {
        set({
          products: get().products.filter(product => product.id !== id)
        });
      },
      
      setSearchTerm: (term: string) => {
        set({ searchTerm: term });
      },
      
      setSelectedCategory: (category: string) => {
        set({ selectedCategory: category });
      },
      
      getFilteredProducts: () => {
        const { products, searchTerm, selectedCategory } = get();
        
        return products.filter(product => {
          const matchesSearch = searchTerm === '' || 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesCategory = selectedCategory === '' || 
            product.category === selectedCategory;
          
          return matchesSearch && matchesCategory && product.isActive;
        });
      },
    }),
    {
      name: 'product-storage',
    }
  )
);