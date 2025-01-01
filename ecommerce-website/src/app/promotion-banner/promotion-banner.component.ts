import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionService } from '../services/promotion.service';

interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  discountPercentage?: number;
  validUntil?: Date;
}

@Component({
  selector: 'app-promotion-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promotion-banner.component.html',
  styleUrls: ['./promotion-banner.component.scss']
})
export class PromotionBannerComponent {
  promotions: Promotion[] = [];
  currentPromotionIndex = 0;
  interval: any;

  constructor(private promotionService: PromotionService) {}

  ngOnInit() {
    this.loadPromotions();
    this.startCarousel();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  async loadPromotions() {
    try {
      this.promotions = await this.promotionService.getActivePromotions().toPromise() || [];
    } catch (error) {
      console.error('Failed to load promotions', error);
    }
  }

  startCarousel() {
    this.interval = setInterval(() => {
      this.nextPromotion();
    }, 5000);
  }

  nextPromotion() {
    this.currentPromotionIndex = 
      (this.currentPromotionIndex + 1) % this.promotions.length;
  }

  previousPromotion() {
    this.currentPromotionIndex = 
      (this.currentPromotionIndex - 1 + this.promotions.length) % this.promotions.length;
  }

  get currentPromotion(): Promotion | null {
    return this.promotions[this.currentPromotionIndex] || null;
  }
}
