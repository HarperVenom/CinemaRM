import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import useApi from "./utils/useApi";
import { backendUrl } from "./config";
import Cookies from "js-cookie";

export const GlobalContext = createContext();

const GlobalState = ({ children }) => {
  const [user, setUser] = useState(null);
  const { getData, postData, updateData, loading } = useApi();
  const [completed, setCompleted] = useState([]);
  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      login(token);
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
        completed: completed,
      };
      user = await postData(`${backendUrl}/api/users`, newUser);
    }
    setUser(user);
    Cookies.set("authToken", token);
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
    setUser(null);
    Cookies.remove("authToken");
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
