import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BagItem, BagState } from "./bagtypes";

const initialState: BagState = {
  items: [],
};

const bagSlice = createSlice({
  name: "bag",
  initialState,
  reducers: {
    addToBag: (state, action: PayloadAction<BagItem>) => {
      const item = action.payload;

      const existing = state.items.find(
        (product) =>
          product.id === item.id && product.size === item.size
      );

      if (existing) {
        existing.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
    },

    removeFromBag: (
      state,
      action: PayloadAction<{
        id: string;
        size: string;
      }>
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(item.id === action.payload.id && item.size === action.payload.size)
      );
    },

    increaseQuantity: (
      state,
      action: PayloadAction<{
        id: string;
        size: string;
      }>
    ) => {
      const item = state.items.find(
        (product) =>
          product.id === action.payload.id &&
          product.size === action.payload.size
      );

      if (item) {
        item.quantity += 1;
      }
    },

    decreaseQuantity: (
      state,
      action: PayloadAction<{
        id: string;
        size: string;
      }>
    ) => {
      const item = state.items.find(
        (product) =>
          product.id === action.payload.id &&
          product.size === action.payload.size
      );

      if (!item) return;

      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.items = state.items.filter(
          (product) =>
            !(
              product.id === action.payload.id &&
              product.size === action.payload.size
            )
        );
      }
    },

    updateSize: (
      state,
      action: PayloadAction<{
        id: string;
        oldSize: string;
        newSize: string;
      }>
    ) => {
      const existingItemIndex = state.items.findIndex(
        (product) =>
          product.id === action.payload.id &&
          product.size === action.payload.oldSize
      );

      if (existingItemIndex !== -1) {
        const itemToUpdate = state.items[existingItemIndex];
        
        const newSizeItemIndex = state.items.findIndex(
          (product) =>
            product.id === action.payload.id &&
            product.size === action.payload.newSize
        );

        if (newSizeItemIndex !== -1 && newSizeItemIndex !== existingItemIndex) {
          state.items[newSizeItemIndex].quantity += itemToUpdate.quantity;
          state.items.splice(existingItemIndex, 1);
        } else {
          itemToUpdate.size = action.payload.newSize;
        }
      }
    },

    clearBag: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToBag,
  removeFromBag,
  increaseQuantity,
  decreaseQuantity,
  updateSize,
  clearBag,
} = bagSlice.actions;

export default bagSlice.reducer;