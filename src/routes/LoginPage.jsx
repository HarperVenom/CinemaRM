import { Form, useNavigate } from "react-router-dom";
import "../styles/loginPage.css";
import useApi from "../utils/useApi";
import { backendUrl } from "../../config";

const LoginPage = () => {
  const { postData } = useApi();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const user = Object.fromEntries([...data.entries()]);
    console.log(user);
    try {
      const response = await postData(`${backendUrl}/api/users`, user);
      console.log(response);
      if (response.status === 200) {
        navigate("/");
      } else {
        throw new Error("failed to submit form");
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="login-page">
      <Form method="post" onSubmit={handleSubmit} className="sign-in-window">
        <h1>Sign Up</h1>
        <label>
          <span>Username:</span>
          <input type="text" name="name" />
        </label>
        <label>
          <span>Email:</span>
          <input type="text" name="email" />
        </label>
        <label>
          <span>Password:</span>
          <input type="text" name="password" />
        </label>
        <button type="submit">Sign Up</button>
      </Form>
    </div>
  );
};

export default LoginPage;
