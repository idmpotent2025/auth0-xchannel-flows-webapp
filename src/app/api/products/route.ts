import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS, getAllProducts, getProductsByCategory, CategoryKey, CATEGORY_LABELS } from '@/lib/constants/products';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let products;
    if (category && category !== 'all') {
      // Validate category
      if (!(category in PRODUCTS)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }
      products = getProductsByCategory(category as CategoryKey);
    } else {
      products = getAllProducts();
    }

    return NextResponse.json({
      products,
      categories: Object.keys(CATEGORY_LABELS),
      categoryLabels: CATEGORY_LABELS,
      total: products.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
