import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { of, throwError } from 'rxjs';

import { OrderTrackingComponent } from './order-tracking.component';
import { OrderService, Order, OrderItem, ShippingAddress } from '../services/order.service';
import { AuthService } from '../services/auth.service';

describe('OrderTrackingComponent', () => {
  let component: OrderTrackingComponent;
  let fixture: ComponentFixture<OrderTrackingComponent>;
  let orderService: jest.Mocked<OrderService>;
  let authService: jest.Mocked<AuthService>;

  const mockOrder: Order = {
    id: 'ORDER123',
    status: 'shipped',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        productId: 'PROD1',
        quantity: 2,
        price: 100
      }
    ],
    total: 200,
    shippingAddress: {
      name: 'Test User',
      address: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zip: '12345',
      country: 'Test Country'
    },
    paymentMethod: 'credit_card',
    trackingNumber: 'TRACK123',
    estimatedDelivery: new Date().toISOString()
  };

  const mockUser = {
    id: 'USER123',
    name: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(async () => {
    const orderServiceMock = {
      getOrderDetails: jest.fn(),
      getOrderHistory: jest.fn()
    };

    const authServiceMock = {
      isAuthenticated: jest.fn(),
      getCurrentUser: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        OrderTrackingComponent,
        ReactiveFormsModule,
        CommonModule
      ],
      providers: [
        { provide: OrderService, useValue: orderServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        DatePipe,
        CurrencyPipe
      ]
    }).compileComponents();

    orderService = TestBed.inject(OrderService) as jest.Mocked<OrderService>;
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderTrackingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    authService.isAuthenticated.mockReturnValue(false);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize form with empty values', () => {
      authService.isAuthenticated.mockReturnValue(false);
      fixture.detectChanges();

      expect(component.trackingForm.get('orderId')?.value).toBe('');
      expect(component.trackingForm.get('email')?.value).toBe('');
    });

    it('should load order history for authenticated users', fakeAsync(() => {
      authService.isAuthenticated.mockReturnValue(true);
      authService.getCurrentUser.mockReturnValue(of(mockUser));
      orderService.getOrderHistory.mockReturnValue(of([mockOrder]));

      fixture.detectChanges();
      tick();

      expect(component.isLoggedIn).toBeTruthy();
      expect(component.orderHistory).toEqual([mockOrder]);
    }));

    it('should handle error when loading order history', fakeAsync(() => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      authService.isAuthenticated.mockReturnValue(true);
      authService.getCurrentUser.mockReturnValue(of(mockUser));
      orderService.getOrderHistory.mockReturnValue(throwError(() => new Error('Failed to load')));

      fixture.detectChanges();
      tick();

      expect(consoleError).toHaveBeenCalledWith('Failed to load order history', expect.any(Error));
      expect(component.orderHistory).toEqual([]);
      consoleError.mockRestore();
    }));
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      authService.isAuthenticated.mockReturnValue(false);
      fixture.detectChanges();
    });

    it('should validate required fields', () => {
      expect(component.trackingForm.valid).toBeFalsy();
      expect(component.trackingForm.get('orderId')?.errors?.['required']).toBeTruthy();
      expect(component.trackingForm.get('email')?.errors?.['required']).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.trackingForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.errors?.['email']).toBeTruthy();

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.errors).toBeNull();
    });
  });

  describe('Order Tracking', () => {
    beforeEach(() => {
      authService.isAuthenticated.mockReturnValue(false);
      fixture.detectChanges();
    });

    it('should not track order with invalid form', async () => {
      await component.trackOrder();
      expect(orderService.getOrderDetails).not.toHaveBeenCalled();
    });

    it('should track order with valid details', async () => {
      orderService.getOrderDetails.mockReturnValue(of(mockOrder));

      component.trackingForm.patchValue({
        orderId: 'ORDER123',
        email: 'test@example.com'
      });

      await component.trackOrder();

      expect(orderService.getOrderDetails).toHaveBeenCalledWith('ORDER123', 'test@example.com');
      expect(component.orderDetails).toEqual(mockOrder);
      expect(component.loading).toBeFalsy();
      expect(component.errorMessage).toBe('');
    });

    it('should handle order not found', async () => {
      orderService.getOrderDetails.mockReturnValue(of(null as unknown as Order));

      component.trackingForm.patchValue({
        orderId: 'INVALID123',
        email: 'test@example.com'
      });

      await component.trackOrder();

      expect(component.errorMessage).toBe('Order not found');
      expect(component.orderDetails).toBeNull();
      expect(component.loading).toBeFalsy();
    });

    it('should handle tracking error', async () => {
      orderService.getOrderDetails.mockReturnValue(throwError(() => new Error('Failed to fetch')));

      component.trackingForm.patchValue({
        orderId: 'ORDER123',
        email: 'test@example.com'
      });

      await component.trackOrder();

      expect(component.errorMessage).toBe('Failed to fetch');
      expect(component.orderDetails).toBeNull();
      expect(component.loading).toBeFalsy();
    });
  });

  describe('Status Classes', () => {
    beforeEach(() => {
      authService.isAuthenticated.mockReturnValue(false);
      fixture.detectChanges();
    });

    it('should return correct class for shipped status', () => {
      expect(component.getOrderStatusClass('shipped')).toBe('status-shipped');
    });

    it('should return correct class for delivered status', () => {
      expect(component.getOrderStatusClass('delivered')).toBe('status-delivered');
    });

    it('should return correct class for cancelled status', () => {
      expect(component.getOrderStatusClass('cancelled')).toBe('status-cancelled');
    });

    it('should return default class for unknown status', () => {
      expect(component.getOrderStatusClass('unknown')).toBe('status-processing');
    });

    it('should handle case-insensitive status', () => {
      expect(component.getOrderStatusClass('SHIPPED')).toBe('status-shipped');
      expect(component.getOrderStatusClass('Delivered')).toBe('status-delivered');
    });
  });
});
