import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductReviewsComponent } from './product-reviews.component';
import { FormBuilder } from '@angular/forms';
import { ReviewService } from '../services/review.service';

describe('ProductReviewsComponent', () => {
  let component: ProductReviewsComponent;
  let fixture: ComponentFixture<ProductReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductReviewsComponent],
      providers: [
        FormBuilder,
        { provide: ReviewService, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
