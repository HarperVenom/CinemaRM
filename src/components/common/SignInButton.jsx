import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "@/GlobalState";
const SignInButton = () => {
  const { login } = useContext(GlobalContext);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        login(tokenResponse.access_token);
      } catch (err) {
        console.log(err);
      }
    },
  });

  return (
    <div onClick={() => googleLogin()} className="sign-in-button">
      Sign In
    </div>
  );
};

export default SignInButton;
