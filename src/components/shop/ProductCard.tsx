import { Product } from '@/lib/constants/products';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-6xl">
          {product.category === 'dresses' && '👗'}
          {product.category === 'petFood' && '🐾'}
          {product.category === 'burritos' && '🌯'}
          {product.category === 'cpgGoods' && '📦'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(product)}
              className="bg-accent hover:bg-accent-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
