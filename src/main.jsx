import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "@/styles/global.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import HomePage from "@/routes/HomePage/HomePage";
import FranchisePage, {
  loader as franchisePageLoader,
} from "@/routes/FranchisePage/FranchisePage";
import Root from "@/routes/root";

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
      <RouterProvider router={router}></RouterProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
