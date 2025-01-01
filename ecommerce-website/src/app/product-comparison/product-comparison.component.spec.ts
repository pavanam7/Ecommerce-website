import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductComparisonComponent } from './product-comparison.component';
import { FormBuilder } from '@angular/forms';
import { ProductService } from '../services/product.service';

describe('ProductComparisonComponent', () => {
  let component: ProductComparisonComponent;
  let fixture: ComponentFixture<ProductComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductComparisonComponent],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
