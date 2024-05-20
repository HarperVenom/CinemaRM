import { createSelector, createSlice } from "@reduxjs/toolkit";

export const franchiseSlice = createSlice({
  name: "franchise",
  initialState: {
    value: {
      universeId: null,
      filters: {},
      layout: null,
      selectedId: null,
      activeIds: [],
    },
  },
  reducers: {
    setUniverseId: (state, action) => {
      state.value.universeId = action.payload;
    },
    setFilters: (state, action) => {
      state.value.filters = action.payload;
    },
    updateFilter: (state, action) => {
      const { filter, value } = action.payload;
      state.value.filters[filter] = value;
    },
    setLayout: (state, action) => {
      state.value.layout = action.payload;
    },
    setSelectedId: (state, action) => {
      state.value.selectedId = action.payload;
    },
    setActiveIds: (state, action) => {
      state.value.activeIds = action.payload;
    },
  },
});

export const selectUniverseId = (state) => state.franchise.value.universeId;

export const selectFilters = (state) => state.franchise.value.filters;

// export const selectActiveFilters = (state) =>
//   Object.entries(state.franchise.value.filters)
//     .filter(([key, value]) => value === true)
//     .map(([key, value]) => key);
export const selectLayout = (state) => state.franchise.value.layout;
export const selectSelectedId = (state) => state.franchise.value.selectedId;
export const selectActiveIds = (state) => state.franchise.value.activeIds;

export const makeSelectAllFilters = () =>
  createSelector([selectFilters], (filters) =>
    Object.entries(filters).map(([key, value]) => key)
  );
export const makeSelectActiveFilters = () =>
  createSelector([selectFilters], (filters) =>
    Object.entries(filters)
      .filter(([key, value]) => value === true)
      .map(([key, value]) => key)
  );

export const {
  setUniverseId,
  setFilters,
  updateFilter,
  setLayout,
  setSelectedId,
  setActiveIds,
} = franchiseSlice.actions;
export default franchiseSlice.reducer;
