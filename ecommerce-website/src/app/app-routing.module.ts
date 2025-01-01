import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckoutSuccessComponent } from './checkout/checkout-success.component';
import { CheckoutFailureComponent } from './checkout/checkout-failure.component';

const routes: Routes = [
  { path: 'checkout/success', component: CheckoutSuccessComponent },
  { path: 'checkout/failure', component: CheckoutFailureComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 