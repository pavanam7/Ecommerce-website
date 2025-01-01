import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceOptimizationComponent } from './performance-optimization.component';

describe('PerformanceOptimizationComponent', () => {
  let component: PerformanceOptimizationComponent;
  let fixture: ComponentFixture<PerformanceOptimizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceOptimizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformanceOptimizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
