import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  loading: boolean = true;
  error: string | null = null;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.loading = true;
    this.error = null;
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.total = this.cartService.calculateTotal(items);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load cart items';
        this.loading = false;
        console.error('Error loading cart:', err);
      }
    });
  }

  updateItem(item: CartItem, newQuantity: number): void {
    const updatedItem = { ...item, quantity: newQuantity };
    this.cartService.updateItem(updatedItem).subscribe({
      next: () => {
        this.loadCartItems();
      },
      error: (err) => {
        this.error = 'Failed to update item';
        console.error('Error updating item:', err);
      }
    });
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item).subscribe({
      next: () => {
        this.loadCartItems();
      },
      error: (err) => {
        this.error = 'Failed to remove item';
        console.error('Error removing item:', err);
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.cartItems = [];
        this.total = 0;
      },
      error: (err) => {
        this.error = 'Failed to clear cart';
        console.error('Error clearing cart:', err);
      }
    });
  }
}
