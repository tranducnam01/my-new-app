import { configureStore } from "@reduxjs/toolkit";
import CartSlide from "./CartSlice";

export const Store=configureStore({
    reducer:{
        CartSlide,

    },
});