import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutComponent } from './checkout.component';
import { PaymentService } from '../services/payment.service';
import { CartService } from '../services/cart.service';
import { of, throwError } from 'rxjs';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let paymentService: jest.Mocked<PaymentService>;
  let cartService: jest.Mocked<CartService>;
  let router: jest.Mocked<Router>;

  const mockStripe = {
    elements: jest.fn().mockReturnValue({
      create: jest.fn().mockReturnValue({
        mount: jest.fn(),
        on: jest.fn()
      })
    }),
    confirmCardPayment: jest.fn()
  };

  const mockPaymentMethods = [
    {
      id: 'pm_1',
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2024
    }
  ];

  beforeEach(async () => {
    // Mock global Stripe
    global.Stripe = jest.fn().mockReturnValue(mockStripe);

    const paymentServiceMock = {
      getPaymentMethods: jest.fn().mockReturnValue(of(mockPaymentMethods)),
      createPaymentIntent: jest.fn().mockReturnValue(of({
        clientSecret: 'test_secret'
      }))
    };

    const cartServiceMock = {
      getTotal: jest.fn().mockReturnValue(100),
      clearCart: jest.fn()
    };

    const routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CheckoutComponent],
      providers: [
        { provide: PaymentService, useValue: paymentServiceMock },
        { provide: CartService, useValue: cartServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    paymentService = TestBed.inject(PaymentService) as jest.Mocked<PaymentService>;
    cartService = TestBed.inject(CartService) as jest.Mocked<CartService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should initialize with invalid form', () => {
      expect(component.checkoutForm.valid).toBeFalsy();
    });

    it('should validate required fields', () => {
      const form = component.checkoutForm;
      expect(form.get('name')?.errors?.['required']).toBeTruthy();
      expect(form.get('email')?.errors?.['required']).toBeTruthy();
      expect(form.get('address')?.errors?.['required']).toBeTruthy();
      expect(form.get('city')?.errors?.['required']).toBeTruthy();
      expect(form.get('state')?.errors?.['required']).toBeTruthy();
      expect(form.get('zip')?.errors?.['required']).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.checkoutForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.errors?.['email']).toBeTruthy();
      emailControl?.setValue('valid@email.com');
      expect(emailControl?.errors).toBeNull();
    });

    it('should be valid when all fields are filled correctly', () => {
      component.checkoutForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zip: '12345'
      });
      expect(component.checkoutForm.valid).toBeTruthy();
    });
  });

  describe('Payment Processing', () => {
    beforeEach(() => {
      component.checkoutForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zip: '12345'
      });
    });

    it('should initialize Stripe elements', fakeAsync(() => {
      component.ngOnInit();
      tick();
      expect(mockStripe.elements).toHaveBeenCalled();
      expect(component.card).toBeDefined();
    }));

    it('should load payment methods', fakeAsync(() => {
      component.ngOnInit();
      tick();
      expect(paymentService.getPaymentMethods).toHaveBeenCalled();
      expect(component.paymentMethods).toEqual(mockPaymentMethods);
    }));

    it('should handle payment method load error', fakeAsync(() => {
      const consoleError = jest.spyOn(console, 'error');
      paymentService.getPaymentMethods.mockReturnValue(throwError(() => new Error('Network error')));
      component.ngOnInit();
      tick();
      expect(consoleError).toHaveBeenCalled();
      expect(component.paymentMethods).toEqual([]);
    }));

    it('should create payment intent on submit', fakeAsync(() => {
      mockStripe.confirmCardPayment.mockResolvedValue({
        paymentIntent: { status: 'succeeded' }
      });

      component.onSubmit();
      tick();

      expect(paymentService.createPaymentIntent).toHaveBeenCalledWith(100, 'USD');
      expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith(
        'test_secret',
        expect.any(Object)
      );
    }));

    it('should handle successful payment', fakeAsync(() => {
      mockStripe.confirmCardPayment.mockResolvedValue({
        paymentIntent: { status: 'succeeded' }
      });

      component.onSubmit();
      tick();

      expect(cartService.clearCart).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(
        ['/checkout/success'],
        expect.any(Object)
      );
    }));

    it('should handle payment failure', fakeAsync(() => {
      mockStripe.confirmCardPayment.mockRejectedValue({
        message: 'Payment failed'
      });

      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Payment failed');
      expect(cartService.clearCart).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('Cart Integration', () => {
    it('should get cart total', () => {
      expect(component.totalAmount).toBe(100);
      expect(cartService.getTotal).toHaveBeenCalled();
    });

    it('should clear cart after successful payment', fakeAsync(() => {
      mockStripe.confirmCardPayment.mockResolvedValue({
        paymentIntent: { status: 'succeeded' }
      });

      component.checkoutForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zip: '12345'
      });

      component.onSubmit();
      tick();

      expect(cartService.clearCart).toHaveBeenCalled();
    }));
  });

  describe('Loading State', () => {
    it('should set loading state during payment processing', fakeAsync(() => {
      mockStripe.confirmCardPayment.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      component.checkoutForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zip: '12345'
      });

      component.onSubmit();
      expect(component.loading).toBeTruthy();
      
      tick(1000);
      expect(component.loading).toBeFalsy();
    }));
  });
});