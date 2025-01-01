import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartGuard implements CanActivate {
  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  canActivate() {
    return this.cartService.getCartItems().pipe(
      take(1),
      map(items => {
        if (items.length === 0) {
          this.router.navigate(['/cart']);
          return false;
        }
        return true;
      })
    );
  }
} 