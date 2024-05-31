import {
  GoogleLogin,
  useGoogleLogin,
  useGoogleOneTapLogin,
} from "@react-oauth/google";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "@/GlobalState";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const CLIENT_ID =
  "41982569166-nkim7lc1na132p34k9fg7bfnac3rnio3.apps.googleusercontent.com";
const CLIENT_SECRET = "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";

const SignInButton = () => {
  const { login } = useContext(GlobalContext);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await axios.post(
          "https://oauth2.googleapis.com/token",
          new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: tokenResponse.code,
            grant_type: "authorization_code",
            redirect_uri: window.location.origin,
          }).toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        login(response.data);
      } catch (err) {
        console.log(err);
      }
    },
    flow: "auth-code",
  });

  return (
    <div onClick={() => googleLogin()} className="sign-in-button">
      Google Login
    </div>
  );
};

export default SignInButton;
