import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-teal flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Link
            href="/"
            className="inline-block bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Go Home
          </Link>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Quick Links:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link href="/login" className="text-primary hover:text-primary-600">
                Login
              </Link>
              <Link href="/shop" className="text-primary hover:text-primary-600">
                Shop
              </Link>
              <Link href="/tv-device" className="text-primary hover:text-primary-600">
                Smart TV
              </Link>
              <Link href="/call-center" className="text-primary hover:text-primary-600">
                Call Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
