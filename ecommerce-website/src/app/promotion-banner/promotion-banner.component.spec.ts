import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import { PromotionBannerComponent } from './promotion-banner.component';
import { PromotionService } from '../services/promotion.service';
import { of, throwError } from 'rxjs';

describe('PromotionBannerComponent', () => {
  let component: PromotionBannerComponent;
  let fixture: ComponentFixture<PromotionBannerComponent>;
  let promotionService: jest.Mocked<PromotionService>;

  const mockPromotions = [
    {
      id: '1',
      title: 'Summer Sale',
      description: 'Get 20% off on all summer items',
      imageUrl: 'summer.jpg',
      discountPercentage: 20,
      validUntil: new Date('2024-08-31')
    },
    {
      id: '2',
      title: 'Winter Collection',
      description: 'New winter collection available',
      imageUrl: 'winter.jpg',
      discountPercentage: 15,
      validUntil: new Date('2024-12-31')
    }
  ];

  beforeEach(async () => {
    const promotionServiceMock = {
      getActivePromotions: jest.fn().mockReturnValue(of(mockPromotions))
    };

    await TestBed.configureTestingModule({
      imports: [PromotionBannerComponent, HttpClientTestingModule],
      providers: [
        { provide: PromotionService, useValue: {} },
        { provide: Zone, useValue: {} }
      ]
    }).compileComponents();

    promotionService = TestBed.inject(PromotionService) as jest.Mocked<PromotionService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotionBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Promotion Loading', () => {
    it('should load promotions on init', fakeAsync(() => {
      component.ngOnInit();
      tick();
      expect(promotionService.getActivePromotions).toHaveBeenCalled();
      expect(component.promotions).toEqual(mockPromotions);
    }));

    it('should handle error when loading promotions', fakeAsync(() => {
      const consoleError = jest.spyOn(console, 'error');
      promotionService.getActivePromotions.mockReturnValue(throwError(() => new Error('Network error')));
      component.loadPromotions();
      tick();
      expect(consoleError).toHaveBeenCalled();
      expect(component.promotions).toEqual([]);
    }));
  });

  describe('Carousel Navigation', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick();
    }));

    it('should start with first promotion', () => {
      expect(component.currentPromotionIndex).toBe(0);
      expect(component.currentPromotion).toEqual(mockPromotions[0]);
    });

    it('should move to next promotion', () => {
      component.nextPromotion();
      expect(component.currentPromotionIndex).toBe(1);
      expect(component.currentPromotion).toEqual(mockPromotions[1]);
    });

    it('should move to previous promotion', () => {
      component.currentPromotionIndex = 1;
      component.previousPromotion();
      expect(component.currentPromotionIndex).toBe(0);
      expect(component.currentPromotion).toEqual(mockPromotions[0]);
    });

    it('should wrap around to first promotion when reaching end', () => {
      component.currentPromotionIndex = mockPromotions.length - 1;
      component.nextPromotion();
      expect(component.currentPromotionIndex).toBe(0);
      expect(component.currentPromotion).toEqual(mockPromotions[0]);
    });

    it('should wrap around to last promotion when going previous from first', () => {
      component.currentPromotionIndex = 0;
      component.previousPromotion();
      expect(component.currentPromotionIndex).toBe(mockPromotions.length - 1);
      expect(component.currentPromotion).toEqual(mockPromotions[mockPromotions.length - 1]);
    });
  });

  describe('Auto Rotation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start carousel rotation on init', fakeAsync(() => {
      component.ngOnInit();
      tick();
      expect(component.interval).toBeDefined();
    }));

    it('should rotate to next promotion automatically', fakeAsync(() => {
      component.ngOnInit();
      tick();
      jest.advanceTimersByTime(5000);
      expect(component.currentPromotionIndex).toBe(1);
    }));

    it('should clear interval on destroy', fakeAsync(() => {
      component.ngOnInit();
      tick();
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
      component.ngOnDestroy();
      expect(clearIntervalSpy).toHaveBeenCalledWith(component.interval);
    }));
  });

  describe('Edge Cases', () => {
    it('should handle empty promotions array', fakeAsync(() => {
      promotionService.getActivePromotions.mockReturnValue(of([]));
      component.ngOnInit();
      tick();
      expect(component.currentPromotion).toBeNull();
    }));

    it('should handle single promotion', fakeAsync(() => {
      const singlePromotion = [mockPromotions[0]];
      promotionService.getActivePromotions.mockReturnValue(of(singlePromotion));
      component.ngOnInit();
      tick();
      component.nextPromotion();
      expect(component.currentPromotionIndex).toBe(0);
      expect(component.currentPromotion).toEqual(singlePromotion[0]);
    }));
  });
});
