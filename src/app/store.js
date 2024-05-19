import { configureStore } from "@reduxjs/toolkit";
// import { franchiseReducer } from "../data/franchiseSlice";
import userReducer from "../data/userSlice";

export default configureStore({
  reducer: {
    user: userReducer,
    // franchise: franchiseReducer,
  },
});
