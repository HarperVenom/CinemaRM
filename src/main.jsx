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
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId =
  "41982569166-nkim7lc1na132p34k9fg7bfnac3rnio3.apps.googleusercontent.com";

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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <Provider store={store}>
        <RouterProvider router={router}></RouterProvider>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
