import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { FormBuilder, FormGroup } from '@angular/forms';

interface ComparisonAttribute {
  name: string;
  displayName: string;
  type: 'number' | 'string' | 'boolean' | 'array';
}

@Component({
  selector: 'app-product-comparison',
  templateUrl: './product-comparison.component.html',
  styleUrls: ['./product-comparison.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class ProductComparisonComponent {
  products: Product[] = [];
  selectedProducts: Product[] = [];
  filteredProducts: Product[] = [];
  comparisonAttributes: ComparisonAttribute[] = [
    { name: 'price', displayName: 'Price', type: 'number' },
    { name: 'rating', displayName: 'Rating', type: 'number' },
    { name: 'features', displayName: 'Features', type: 'array' },
    { name: 'dimensions', displayName: 'Dimensions', type: 'string' },
    { name: 'weight', displayName: 'Weight', type: 'number' },
    { name: 'warranty', displayName: 'Warranty', type: 'string' },
    { name: 'brand', displayName: 'Brand', type: 'string' },
    { name: 'availability', displayName: 'Availability', type: 'boolean' },
    { name: 'reviewsCount', displayName: 'Reviews Count', type: 'number' }
  ];
  filterForm: FormGroup;
  maxCompareProducts = 4;
  loading = false;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      category: ['all'],
      minPrice: [null],
      maxPrice: [null],
      minRating: [null]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    try {
      this.loading = true;
      this.products = (await this.productService.getProducts().toPromise()) || [];
      this.applyFilters();
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      this.loading = false;
    }
  }

  toggleProductSelection(product: Product) {
    const index = this.selectedProducts.findIndex(p => p.id === product.id);
    if (index > -1) {
      this.selectedProducts.splice(index, 1);
    } else {
      if (this.selectedProducts.length < this.maxCompareProducts) {
        this.selectedProducts.push(product);
      }
    }
  }

  isSelected(product: Product): boolean {
    return this.selectedProducts.some(p => p.id === product.id);
  }

  applyFilters() {
    const { search, category, minPrice, maxPrice, minRating } = this.filterForm.value;
    
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !search || 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = category === 'all' || 
        product.category === category;
      
      const matchesPrice = (!minPrice || product.price >= minPrice) &&
        (!maxPrice || product.price <= maxPrice);
      
      const matchesRating = !minRating || 
        (product.rating && product.rating >= minRating);
      
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });
  }

  clearFilters() {
    this.filterForm.reset({
      search: '',
      category: 'all',
      minPrice: null,
      maxPrice: null,
      minRating: null
    });
    this.applyFilters();
  }

  getAttributeValue(product: Product, attribute: string): any {
    return product[attribute as keyof Product];
  }

  formatAttributeValue(value: any, type: string): string {
    switch (type) {
      case 'number':
        return value?.toString() || 'N/A';
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'array':
        return value?.join(', ') || 'N/A';
      default:
        return value?.toString() || 'N/A';
    }
  }
}
