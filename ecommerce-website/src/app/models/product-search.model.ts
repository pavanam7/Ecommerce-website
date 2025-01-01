import { Product } from './product.model';

export interface ProductSearchResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
} 