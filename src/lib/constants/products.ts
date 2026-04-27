export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
}

export type CategoryKey = 'dresses' | 'petFood' | 'burritos' | 'cpgGoods';

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  dresses: 'Dresses',
  petFood: 'Pet Food',
  burritos: 'Burritos',
  cpgGoods: 'CPG Goods',
};

export const PRODUCTS: Record<CategoryKey, Product[]> = {
  dresses: [
    {
      id: "dress1",
      name: "Classic Evening Gown",
      price: 189.99,
      description: "Elegant floor-length gown perfect for formal occasions",
      imageUrl: "dress1",
      category: "dresses"
    },
    {
      id: "dress2",
      name: "Floral Summer Dress",
      price: 79.99,
      description: "Light and breezy dress with vibrant floral patterns",
      imageUrl: "dress2",
      category: "dresses"
    },
    {
      id: "dress3",
      name: "Cocktail Party Dress",
      price: 129.99,
      description: "Sophisticated knee-length dress for cocktail events",
      imageUrl: "dress3",
      category: "dresses"
    },
    {
      id: "dress4",
      name: "Casual Maxi Dress",
      price: 89.99,
      description: "Comfortable full-length dress for everyday wear",
      imageUrl: "dress4",
      category: "dresses"
    },
    {
      id: "dress5",
      name: "Business Professional Dress",
      price: 119.99,
      description: "Tailored dress suitable for office environments",
      imageUrl: "dress5",
      category: "dresses"
    },
    {
      id: "dress6",
      name: "Bohemian Sundress",
      price: 69.99,
      description: "Free-spirited design with flowing silhouette",
      imageUrl: "dress6",
      category: "dresses"
    }
  ],
  petFood: [
    {
      id: "petfood1",
      name: "Premium Puppy Chow",
      price: 49.99,
      description: "Nutrient-rich formula for growing puppies",
      imageUrl: "petfood1",
      category: "petFood"
    },
    {
      id: "petfood2",
      name: "Organic Cat Food",
      price: 39.99,
      description: "All-natural ingredients for healthy cats",
      imageUrl: "petfood2",
      category: "petFood"
    },
    {
      id: "petfood3",
      name: "Senior Dog Formula",
      price: 44.99,
      description: "Specially balanced nutrition for older dogs",
      imageUrl: "petfood3",
      category: "petFood"
    },
    {
      id: "petfood4",
      name: "Grain-Free Dog Food",
      price: 54.99,
      description: "High-protein, grain-free recipe for sensitive stomachs",
      imageUrl: "petfood4",
      category: "petFood"
    },
    {
      id: "petfood5",
      name: "Indoor Cat Formula",
      price: 34.99,
      description: "Designed for indoor cats with reduced activity",
      imageUrl: "petfood5",
      category: "petFood"
    },
    {
      id: "petfood6",
      name: "Dental Health Dog Treats",
      price: 19.99,
      description: "Crunchy treats that promote dental hygiene",
      imageUrl: "petfood6",
      category: "petFood"
    }
  ],
  burritos: [
    {
      id: "burrito",
      name: "Burrito",
      price: 12.99,
      description: "Grilled chicken with rice, beans, and fresh salsa",
      imageUrl: "burrito",
      category: "burritos"
    },
    {
      id: "nachos",
      name: "Nachos",
      price: 14.99,
      description: "Marinated steak with guacamole and pico de gallo",
      imageUrl: "nachos",
      category: "burritos"
    },
    {
      id: "gauc",
      name: "Gauc",
      price: 10.99,
      description: "Black beans, rice, cheese, and grilled vegetables",
      imageUrl: "gauc",
      category: "burritos"
    },
    {
      id: "salsa",
      name: "Salsa",
      price: 15.99,
      description: "Seasoned shrimp with cilantro lime rice",
      imageUrl: "salsa",
      category: "burritos"
    },
    {
      id: "frasca",
      name: "Frasca",
      price: 9.99,
      description: "Scrambled eggs, bacon, cheese, and hash browns",
      imageUrl: "frasca",
      category: "burritos"
    },
    {
      id: "churros",
      name: "Churros",
      price: 13.99,
      description: "Pork, french fries, cheese, and sour cream",
      imageUrl: "churros",
      category: "burritos"
    }
  ],
  cpgGoods: [
    {
      id: "cpg1",
      name: "Organic Almond Milk",
      price: 5.99,
      description: "Unsweetened almond milk in recyclable packaging",
      imageUrl: "cpg1",
      category: "cpgGoods"
    },
    {
      id: "cpg2",
      name: "Artisan Pasta Sauce",
      price: 7.49,
      description: "Small-batch tomato sauce with fresh herbs",
      imageUrl: "cpg2",
      category: "cpgGoods"
    },
    {
      id: "cpg3",
      name: "Cold Brew Coffee",
      price: 4.99,
      description: "Smooth cold brew concentrate, just add water",
      imageUrl: "cpg3",
      category: "cpgGoods"
    },
    {
      id: "cpg4",
      name: "Gourmet Olive Oil",
      price: 14.99,
      description: "Extra virgin olive oil from sustainable groves",
      imageUrl: "cpg4",
      category: "cpgGoods"
    },
    {
      id: "cpg5",
      name: "Protein Bars - Variety Pack",
      price: 19.99,
      description: "12-pack of high-protein snack bars",
      imageUrl: "cpg5",
      category: "cpgGoods"
    },
    {
      id: "cpg6",
      name: "Sparkling Water - Lemon",
      price: 6.99,
      description: "Natural lemon flavored sparkling water, 8-pack",
      imageUrl: "cpg6",
      category: "cpgGoods"
    }
  ]
};

export const getAllProducts = (): Product[] => {
  return Object.values(PRODUCTS).flat();
};

export const getProductsByCategory = (category: CategoryKey): Product[] => {
  return PRODUCTS[category] || [];
};

export const getProductById = (id: string): Product | undefined => {
  return getAllProducts().find(product => product.id === id);
};
