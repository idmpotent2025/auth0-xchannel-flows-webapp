'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Product, CategoryKey } from '@/lib/constants/products';
import { ProductCard } from '@/components/shop/ProductCard';
import { CategoryTabs } from '@/components/shop/CategoryTabs';

export default function ShopPage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryKey | 'all'>('all');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory]);

  const fetchProducts = async (category: CategoryKey | 'all') => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch(`/api/products?category=${category}`);
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
  };

  const cartCount = Object.values(cart).reduce((sum, count) => sum + count, 0);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-teal">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold hover:text-gray-200">
                Identity Architect Demo
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm">{user.name || user.email}</span>
                </div>
              )}
              <div className="relative">
                <button className="bg-accent hover:bg-accent-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <span>🛒</span>
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={logout}
                className="bg-white text-primary hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Product Catalog</h1>
          <p className="text-gray-600">Browse our selection of products</p>
        </div>

        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found in this category</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Powered by Auth0 | Cross-Channel CIAM Demo
            </p>
            <div className="flex gap-4">
              <Link href="/tv-device" className="text-sm text-primary hover:text-primary-600">
                📺 Smart TV
              </Link>
              <Link href="/car-device" className="text-sm text-primary hover:text-primary-600">
                🚗 Smart Car
              </Link>
              <Link href="/call-center" className="text-sm text-primary hover:text-primary-600">
                📞 Call Center
              </Link>
              <Link href="/sso" className="text-sm text-primary hover:text-primary-600">
                🔄 Native2Web SSO
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
