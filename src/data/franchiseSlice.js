import { createSlice } from "@reduxjs/toolkit";

export const franchiseSlice = createSlice({
  name: "franchise",
  initialState: {
    value: {
      selectedElement: null,
      filters: {},
    },
  },
  reducers: {
    select: (state, action) => {
      state.value.selectedElement = action.payload;
    },
    filter: (state, action) => {
      state.value.filters = action.payload;
    },
  },
});

export const filtersSelect = (state) => state.value.filters;

export const { select, filter } = franchiseSlice.actions;
export default franchiseSlice.reducer;
