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
import ProfilePage from "@/routes/ProfilePage/ProfilePage";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";

if (process.env.NODE_ENV === "production") disableReactDevTools();

const clientId = process.env.CLIENT_ID;

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    children: [
      { index: true, element: <HomePage></HomePage> },
      { path: "/profile", element: <ProfilePage></ProfilePage> },
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
