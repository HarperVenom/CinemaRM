import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    value: {
      completed: [],
    },
  },
  reducers: {
    setCompleted: (state, action) => {
      state.value.completed = action.payload;
    },
    addCompleted: (state, action) => {
      const { id, titleId } = action.payload;
      const currentUniverse = state.value.completed.find(
        (universe) => universe.id === id
      );

      if (currentUniverse) {
        const currentTitle = currentUniverse.titles.find((title) => title.id);
        if (currentTitle) return;
        currentUniverse.titles.push(titleId);
      } else {
        state.value.completed.push({ id: id, titles: [titleId] });
      }
    },
  },
});
export const selectCompletedUniverse = (state, id) =>
  state.user.value.completed.find((universe) => universe && universe.id === id)
    ?.titles;
export const selectCompletedIds = (state) => state.user.value.completed;
export const { setCompleted, addCompleted } = userSlice.actions;
export default userSlice.reducer;
