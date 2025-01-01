import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CartComponent } from './cart.component';
import { CartService } from '../services/cart.service';
import { of } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: jest.Mocked<CartService>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    description: 'Test Description',
    imageUrl: 'test.jpg',
    mainImage: 'test.jpg',
    images: ['test.jpg'],
    specifications: [],
    reviews: [],
    rating: 4.5,
    reviewCount: 10,
    availability: true,
    category: 'Test Category'
  };

  const mockCartItems: CartItem[] = [
    {
      product: mockProduct,
      quantity: 2
    }
  ];

  beforeEach(async () => {
    cartService = {
      getCartItems: jest.fn(),
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateItem: jest.fn(),
      clearCart: jest.fn(),
      calculateTotal: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        { provide: CartService, useValue: cartService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cart items on init', fakeAsync(() => {
    cartService.getCartItems.mockReturnValue(of(mockCartItems));
    cartService.calculateTotal.mockReturnValue(199.98); // 99.99 * 2

    fixture.detectChanges();
    tick();

    expect(cartService.getCartItems).toHaveBeenCalled();
    expect(component.cartItems).toEqual(mockCartItems);
    expect(component.total).toBe(199.98);
  }));

  it('should update item quantity', fakeAsync(() => {
    const item = mockCartItems[0];
    const newQuantity = 3;
    const updatedItem = { ...item, quantity: newQuantity };

    cartService.updateItem.mockReturnValue(of(void 0));
    cartService.getCartItems.mockReturnValue(of(mockCartItems));
    cartService.calculateTotal.mockReturnValue(199.98);

    component.updateItem(item, newQuantity);
    tick();

    expect(cartService.updateItem).toHaveBeenCalledWith(updatedItem);
  }));

  it('should remove item', fakeAsync(() => {
    const item = mockCartItems[0];

    cartService.removeItem.mockReturnValue(of(void 0));
    cartService.getCartItems.mockReturnValue(of(mockCartItems));
    cartService.calculateTotal.mockReturnValue(199.98);

    component.removeItem(item);
    tick();

    expect(cartService.removeItem).toHaveBeenCalledWith(item);
  }));

  it('should clear cart', fakeAsync(() => {
    cartService.clearCart.mockReturnValue(of(void 0));

    component.clearCart();
    tick();

    expect(cartService.clearCart).toHaveBeenCalled();
    expect(component.cartItems).toEqual([]);
    expect(component.total).toBe(0);
  }));
});
