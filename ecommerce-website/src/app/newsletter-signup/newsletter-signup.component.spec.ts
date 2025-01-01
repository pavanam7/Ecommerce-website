import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsletterSignupComponent } from './newsletter-signup.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { NewsletterService } from '../services/newsletter.service';

describe('NewsletterSignupComponent', () => {
  let component: NewsletterSignupComponent;
  let fixture: ComponentFixture<NewsletterSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterSignupComponent, HttpClientTestingModule],
      providers: [
        { provide: NewsletterService, useValue: {} },
        { provide: HttpClient, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsletterSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
