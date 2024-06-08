import { useGoogleLogin } from "@react-oauth/google";
import { useContext } from "react";
import { GlobalContext } from "@/GlobalState";
import axios from "axios";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

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
