export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  mainImage: string;
  images: string[];
  specifications: Array<{
    name: string;
    value: string;
  }>;
  reviews: Array<{
    id: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  rating: number;
  reviewCount: number;
  availability: boolean;
  category: string;
}
