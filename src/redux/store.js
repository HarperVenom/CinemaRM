import { configureStore } from "@reduxjs/toolkit";
import franchiseReducer from "./slices/franchiseSlice";
import userReducer from "./slices/userSlice";

export default configureStore({
  reducer: {
    user: userReducer,
    franchise: franchiseReducer,
  },
});
