import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DatePipe } from '@angular/common';
import { LoyaltyProgramComponent } from './loyalty-program.component';

describe('LoyaltyProgramComponent', () => {
  let component: LoyaltyProgramComponent;
  let fixture: ComponentFixture<LoyaltyProgramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyProgramComponent, HttpClientTestingModule],
      providers: [
        { provide: DatePipe, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoyaltyProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
