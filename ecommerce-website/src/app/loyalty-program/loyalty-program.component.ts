import { Component, OnInit } from '@angular/core';
import { LoyaltyService, LoyaltyPoints, Reward, LoyaltyTier } from '../services/loyalty.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loyalty-program',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './loyalty-program.component.html',
  styleUrls: ['./loyalty-program.component.scss']
})
export class LoyaltyProgramComponent implements OnInit {
  points: LoyaltyPoints | null = null;
  rewards: Reward[] = [];
  tiers: LoyaltyTier[] = [];
  history: any[] = [];
  loading = false;

  constructor(
    private loyaltyService: LoyaltyService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadLoyaltyData();
  }

  async loadLoyaltyData() {
    try {
      this.loading = true;
      const pointsResponse = await this.loyaltyService.getPoints().toPromise();
      this.points = pointsResponse || null;
      
      const rewardsResponse = await this.loyaltyService.getRewards().toPromise();
      this.rewards = rewardsResponse || [];
      
      const tiersResponse = await this.loyaltyService.getTiers().toPromise();
      this.tiers = tiersResponse || [];
      
      const historyResponse = await this.loyaltyService.getPointsHistory().toPromise();
      this.history = historyResponse || [];
    } catch (error) {
      console.error('Failed to load loyalty data', error);
    } finally {
      this.loading = false;
    }
  }

  canRedeem(pointsRequired: number): boolean {
    return this.points?.availablePoints ? this.points.availablePoints >= pointsRequired : false;
  }

  async redeemReward(rewardId: string) {
    try {
      this.loading = true;
      await this.loyaltyService.redeemReward(rewardId).toPromise();
      this.loadLoyaltyData(); // Refresh data after redemption
    } catch (error) {
      console.error('Failed to redeem reward', error);
    } finally {
      this.loading = false;
    }
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'mediumDate') || '';
  }
}
