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
    // Nếu sản phẩm đã tồn tại trong giỏ, tăng quantity lên nếu còn hàng
    if (existing.quantity < existing.pieces) {
      existing.quantity += 1;
      existing.totalPrice = existing.quantity * existing.pieces; // Tính lại giá trị tổng
    }
  } else {
    // Thêm sản phẩm mới vào giỏ
    const totalPrice = product.price * product.pieces; // Tính giá trị tổng = price * pieces
    state.push({
      ...product,
      quantity: 1, // Bắt đầu với 1 sản phẩm
      totalPrice,  // Lưu giá trị tổng
    });
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
    },
    setCartFromServer: (state, action) => {
      return action.payload; // Ghi đè luôn bằng data server trả về
    }
    
  }
});

export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
  setCartFromServer,
} = cartSlice.actions;

export default cartSlice.reducer;
