import { RootState } from "../../app/store";

export const selectBagItems = (state: RootState) => state.bag.items;

export const selectBagCount = (state: RootState) =>
  state.bag.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

export const selectBagSubtotal = (state: RootState) =>
  state.bag.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

export const selectBagTotal = (state: RootState) =>
  state.bag.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

export const selectBagItemById =
  (id: string, size: string) =>
  (state: RootState) =>
    state.bag.items.find(
      (item) => item.id === id && item.size === size
    );