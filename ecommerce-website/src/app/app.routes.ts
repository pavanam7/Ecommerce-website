import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CheckoutSuccessComponent } from './checkout/checkout-success.component';
import { CheckoutFailureComponent } from './checkout/checkout-failure.component';
import { ContactComponent } from './contact/contact.component';
import { FaqComponent } from './faq/faq.component';
import { BlogPostListComponent } from './blog-post-list/blog-post-list.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { OrderTrackingComponent } from './order-tracking/order-tracking.component';
import { ProfileComponent } from './profile/profile.component';
import { LiveChatComponent } from './live-chat/live-chat.component';
import { ProductComparisonComponent } from './product-comparison/product-comparison.component';
import { AuthGuard } from './guards/auth.guard';
import { CartGuard } from './guards/cart.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
  { 
    path: 'checkout',
    canActivate: [CartGuard],
    children: [
      { path: '', component: CheckoutComponent },
      { path: 'success', component: CheckoutSuccessComponent },
      { path: 'failure', component: CheckoutFailureComponent }
    ]
  },
  { path: 'contact', component: ContactComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'blog', component: BlogPostListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'wishlist', 
    component: WishlistComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'orders', 
    component: OrderTrackingComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  { path: 'chat', component: LiveChatComponent },
  { path: 'compare', component: ProductComparisonComponent },
  { path: '**', redirectTo: '' }
];
