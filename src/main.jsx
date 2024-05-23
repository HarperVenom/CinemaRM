import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/global.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import HomePage from "./routes/HomePage";
import FranchisePage, {
  loader as franchisePageLoader,
} from "./routes/FranchisePage";
import Root from "./routes/root";
import LoginPage from "./routes/LoginPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    children: [
      { index: true, element: <HomePage></HomePage> },
      {
        path: "/:universeId",
        element: <FranchisePage></FranchisePage>,
        loader: franchisePageLoader,
      },
      {
        path: "/login",
        element: <LoginPage></LoginPage>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}></RouterProvider>
    </Provider>
  </React.StrictMode>
);
