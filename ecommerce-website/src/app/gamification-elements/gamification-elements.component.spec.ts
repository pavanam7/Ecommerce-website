import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamificationElementsComponent } from './gamification-elements.component';

describe('GamificationElementsComponent', () => {
  let component: GamificationElementsComponent;
  let fixture: ComponentFixture<GamificationElementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamificationElementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamificationElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
