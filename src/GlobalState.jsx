import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import useApi from "./utils/useApi";
import { backendUrl } from "./config";
import Cookies from "js-cookie";

export const GlobalContext = createContext();

const CLIENT_ID =
  "41982569166-nkim7lc1na132p34k9fg7bfnac3rnio3.apps.googleusercontent.com";
const CLIENT_SECRET = "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";

const GlobalState = ({ children }) => {
  const [user, setUser] = useState(null);
  const { getData, postData, updateData, loading } = useApi();
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    const access_token = Cookies.get("accessToken");
    const refresh_token = Cookies.get("refreshToken");

    if (access_token && refresh_token) {
      login({ access_token: access_token, refresh_token: refresh_token });
    }
  }, []);

  useEffect(() => {
    if (!user || user.completed === completed) return;
    updateUser({ completed: completed });
  }, [completed]);

  useEffect(() => {
    if (!user) {
      setCompleted([]);
      return;
    }
    setCompleted(user.completed);
  }, [user]);

  async function refreshToken() {
    const refresh_token = Cookies.get("refreshToken");
    if (!refresh_token) return;

    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    Cookies.set("accessToken", response.data.access_token);
    login({
      access_token: response.data.access_token,
      refresh_token: refresh_token,
    });
  }

  async function login(tokens) {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );
      const data = response.data;
      let user = await getData(`${backendUrl}/api/users/${data.sub}`);
      if (!user) {
        const newUser = {
          id: data.sub,
          name: data.given_name,
          email: data.email,
          picture: data.picture,
          completed: completed,
        };
        user = await postData(`${backendUrl}/api/users`, newUser);
        setUser(newUser);
        Cookies.set("accessToken", tokens.access_token);
        Cookies.set("refreshToken", tokens.refresh_token);
        return;
      }
      setUser(user);
      Cookies.set("accessToken", tokens.access_token);
      Cookies.set("refreshToken", tokens.refresh_token);
    } catch (err) {
      if (!err.response) {
        console.log(err.message);
        return;
      }
      if (err.response.status === 401 || err.response.status === 403) {
        refreshToken();
      }
    }
  }

  async function updateUser(userUpdate) {
    if (!user) return;
    const response = await updateData(
      `${backendUrl}/api/users/${user.id}`,
      userUpdate
    );
    setUser(response.data);
  }

  function logout() {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    setUser(null);
  }

  return (
    <GlobalContext.Provider
      value={{
        user,
        completed,
        setCompleted,
        login,
        logout,
        updateUser,
        loading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalState;
