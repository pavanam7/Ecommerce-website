import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibilityToggleComponent } from './accessibility-toggle.component';

describe('AccessibilityToggleComponent', () => {
  let component: AccessibilityToggleComponent;
  let fixture: ComponentFixture<AccessibilityToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessibilityToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessibilityToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
