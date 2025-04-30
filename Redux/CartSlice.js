// Redux/CartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = [];

export const cartSlice = createSlice({
  name: 'CartSlide',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existing = state.find(item => item.productId === product.productId);

      if (existing) {
        if (existing.quantity < existing.pieces) {
          existing.quantity += 1;
        }
      } else {
        state.push({ ...product, quantity: 1 });
      }
    },

    incrementQuantity: (state, action) => {
      const product = state.find(item => item.productId === action.payload.productId);
      if (product && product.quantity < product.pieces) {
        product.quantity += 1;
      }
    },

    decrementQuantity: (state, action) => {
      const product = state.find(item => item.productId === action.payload.productId);
      if (product && product.quantity > 1) {
        product.quantity -= 1;
      }
    },

    removeFromCart: (state, action) => {
      return state.filter(item => item.productId !== action.payload.productId);
    },

    clearCart: () => {
      return [];
    }
  }
});

export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
