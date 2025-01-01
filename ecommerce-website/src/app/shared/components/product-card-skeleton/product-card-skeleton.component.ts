import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonLoaderComponent],
  template: `
    <div class="product-card-skeleton">
      <app-skeleton-loader height="200px"></app-skeleton-loader>
      <div class="content">
        <app-skeleton-loader height="24px" width="70%"></app-skeleton-loader>
        <app-skeleton-loader height="18px" width="40%" style="margin: 10px 0"></app-skeleton-loader>
        <app-skeleton-loader height="20px" width="30%"></app-skeleton-loader>
        <div class="actions">
          <app-skeleton-loader height="36px" width="48%"></app-skeleton-loader>
          <app-skeleton-loader height="36px" width="48%"></app-skeleton-loader>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card-skeleton {
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .content {
      padding: 16px;
    }

    .actions {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
    }
  `]
})
export class ProductCardSkeletonComponent {} 