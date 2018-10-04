import { createEntityAdapter, EntityState, Dictionary } from '@ngrx/entity';
import produce from 'immer';

import { CartActions, CartActionTypes } from './cart.action';
import { CartItem } from './../cart.model';

const cartAdapter = createEntityAdapter<CartItem>({
  selectId: (cart: CartItem) => cart.productId
});

export interface State extends EntityState<CartItem> {
  isloading: boolean;
}

const initialState = cartAdapter.getInitialState({
  isloading: false
});

export function reducer(state = initialState, action: CartActions) {
  return produce(state, draft => {
    switch (action.type) {
      case CartActionTypes.AddItem: {
        const ids = draft.ids as Array<number | string>;
        if (ids.includes(action.payload.productId)) {
          draft.entities[action.payload.productId].quantity +=
            action.payload.quantity;
          break;
        } else {
          return cartAdapter.addOne(action.payload, draft);
        }
      }
      case CartActionTypes.AdjustQuantity: {
        const ids = draft.ids as Array<number | string>;
        if (ids.includes(action.payload.id)) {
          draft.entities[action.payload.id].quantity = action.payload.quantity;
          break;
        }
        return;
      }
      case CartActionTypes.RemoveItem: {
        const ids = draft.ids as Array<number | string>;
        if (ids.includes(action.payload)) {
          return cartAdapter.removeOne(action.payload, draft);
        }
        break;
      }
      case CartActionTypes.ConfirmOrder: {
        draft.isloading = true;
        break;
      }
      case CartActionTypes.ConfirmOrderSuccess: {
        return initialState;
      }
      case CartActionTypes.ConfirmOrderFail: {
        draft.isloading = false;
        break;
      }
      case CartActionTypes.GetCartItemSuccess: {
        draft.ids = action.payload.carts.map(cart => cart.productId);
        draft.entities = action.payload.carts.reduce(
          (acc, cur) => {
            acc[cur.productId] = cur;
            return acc;
          },
          {} as Dictionary<CartItem>
        );
        break;
      }
      case CartActionTypes.ResetCart: {
        return initialState;
      }
    }
  });
}

const { selectEntities, selectAll } = cartAdapter.getSelectors();

export const selectCartEntities = selectEntities;
export const selectAllCartItems = selectAll;
