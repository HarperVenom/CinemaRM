import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import useApi from "./utils/useApi";
import { backendUrl } from "../config";
import Cookies from "js-cookie";

export const GlobalContext = createContext();

const GlobalState = ({ children }) => {
  const [user, setUser] = useState(null);
  const { getData, postData } = useApi();

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      login(token);
    }
  }, []);

  async function login(token) {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
      };
      user = await postData(`${backendUrl}/api/users`, newUser);
    }
    setUser(user);
    Cookies.set("authToken", token);
  }

  function logout() {
    setUser(null);
    Cookies.remove("authToken");
  }

  return (
    <GlobalContext.Provider value={{ user, login, logout }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalState;
