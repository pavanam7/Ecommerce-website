import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product, RelatedProduct, ProductVariant } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProductReviewFormComponent } from './product-review-form/product-review-form.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FontAwesomeModule,
    ProductReviewFormComponent
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: RelatedProduct[] = [];
  selectedImage: string | null = null;
  selectedVariant: ProductVariant | null = null;
  selectedSize: string | null = null;
  selectedColor: string | null = null;
  showSpecs = false;
  showReviews = false;
  showReviewForm = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  get availableSizes(): string[] {
    if (!this.product?.variants) return [];
    return [...new Set(this.product.variants
      .filter(v => v.size)
      .map(v => v.size as string))];
  }

  get availableColors(): string[] {
    if (!this.product?.variants) return [];
    return [...new Set(this.product.variants
      .filter(v => v.color)
      .map(v => v.color as string))];
  }

  get stockStatus(): string {
    if (!this.product) return 'Out of stock';
    if (this.product.variants && this.selectedVariant) {
      return `${this.selectedVariant.stock} in stock`;
    }
    return this.product.availability ? 'In stock' : 'Out of stock';
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    this.updateSelectedVariant();
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.updateSelectedVariant();
  }

  updateSelectedVariant(): void {
    if (!this.product?.variants) return;
    
    this.selectedVariant = this.product.variants.find(v => 
      v.size === this.selectedSize && 
      v.color === this.selectedColor
    ) || null;
  }

  toggleSpecs(): void {
    this.showSpecs = !this.showSpecs;
  }

  toggleReviews(): void {
    this.showReviews = !this.showReviews;
  }

  loadProduct(productId: string): void {
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedImage = product.mainImage;
        this.loadRelatedProducts(product.category);
      },
      error: (err) => console.error('Error loading product', err)
    });
  }

  loadRelatedProducts(category: string | undefined): void {
    if (!category) return;
    
    this.productService.getProductsByCategory(category).subscribe({
      next: (products) => {
        this.relatedProducts = products
          .filter(p => p.id !== this.product?.id)
          .slice(0, 4)
          .map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.mainImage
          }));
      },
      error: (err) => console.error('Error loading related products', err)
    });
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  addToCart(): void {
    if (!this.product) return;

    const item = {
      product: this.product,
      quantity: 1
    };

    if (this.selectedVariant) {
      item.product = {
        ...this.product,
        price: this.selectedVariant.price || this.product.price,
        imageUrl: this.selectedVariant.imageUrl || this.product.mainImage,
        variant: {
          size: this.selectedVariant.size,
          color: this.selectedVariant.color
        }
      };
    }

    this.cartService.addItem(item);
  }

  addToWishlist(): void {
    if (this.product) {
      this.wishlistService.addToWishlist({ productId: this.product.id }).subscribe({
        next: () => console.log('Added to wishlist'),
        error: (err) => console.error('Error adding to wishlist', err)
      });
    }
  }

  openReviewForm(): void {
    this.showReviewForm = true;
    this.showReviews = true;
  }

  onReviewSubmitted(): void {
    if (this.product) {
      this.productService.getProductById(this.product.id).subscribe({
        next: (product) => {
          this.product = product;
          this.showReviewForm = false;
        },
        error: (err) => console.error('Error refreshing product reviews', err)
      });
    }
  }
}
