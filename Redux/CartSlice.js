import { createSlice } from "@reduxjs/toolkit";


const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const item = state.find((v) => v.Name === action.payload.Name);
      if (item) {
        item.quantity += 1;
      } else {
        state.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      return state.filter((v) => v.Name !== action.payload.Name);
    },
    incrementQuantity: (state, action) => {
      const item = state.find((v) => v.Name === action.payload.Name);
      if (item) item.quantity++;
    },
    decrementQuantity: (state, action) => {
      const item = state.find((v) => v.Name === action.payload.Name);
      if (item && item.quantity > 1) item.quantity--;
    },
    clearCart: () => {
      return [];
    },
  },
});

export const { addToCart, removeFromCart, incrementQuantity, decrementQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
