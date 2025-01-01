import { createAction, props } from '@ngrx/store';

export const FetchProducts = createAction('[Product] Fetch Products');
export const AddToCart = createAction(
  '[Cart] Add to Cart',
  props<{ productId: string }>()
);
