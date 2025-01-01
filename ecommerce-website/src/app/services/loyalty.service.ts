import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoyaltyPoints {
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
}

export interface Reward {
  id: string;
  name: string;
  pointsRequired: number;
  description: string;
  imageUrl?: string;
}

export interface LoyaltyTier {
  name: string;
  pointsRequired: number;
  benefits: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LoyaltyService {
  private pointsSubject = new BehaviorSubject<LoyaltyPoints>({
    totalPoints: 0,
    availablePoints: 0,
    usedPoints: 0
  });
  
  points$ = this.pointsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getPoints(): Observable<LoyaltyPoints> {
    return this.http.get<LoyaltyPoints>('/api/loyalty/points');
  }

  getRewards(): Observable<Reward[]> {
    return this.http.get<Reward[]>('/api/loyalty/rewards');
  }

  getTiers(): Observable<LoyaltyTier[]> {
    return this.http.get<LoyaltyTier[]>('/api/loyalty/tiers');
  }

  redeemReward(rewardId: string): Observable<any> {
    return this.http.post('/api/loyalty/redeem', { rewardId });
  }

  getPointsHistory(): Observable<any[]> {
    return this.http.get<any[]>('/api/loyalty/history');
  }

  updatePoints(points: LoyaltyPoints) {
    this.pointsSubject.next(points);
  }
}
