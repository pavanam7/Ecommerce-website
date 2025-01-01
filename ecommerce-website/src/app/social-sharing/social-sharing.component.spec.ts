import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialSharingComponent } from './social-sharing.component';

describe('SocialSharingComponent', () => {
  let component: SocialSharingComponent;
  let fixture: ComponentFixture<SocialSharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialSharingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialSharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
