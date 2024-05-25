import { useContext, useEffect, useState } from "react";
import useApi from "../utils/useApi";
import { Form, Link } from "react-router-dom";
import "../styles/homePage.css";
import UniverseBlock from "../components/common/UniverseBlock";
import { backendUrl } from "../../config";
import SignInButton from "../components/common/SignInButton";
import { GlobalContext } from "../GlobalState";
import UserIcon from "../assets/user.svg";

const HomePage = () => {
  const { user, logout } = useContext(GlobalContext);
  const { data } = useApi(`${backendUrl}/api/universes`);
  const [universes, setUniverses] = useState([]);

  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!data) return;
    setUniverses(
      data.map((universe) => ({
        id: universe.id,
        title: universe.title,
        imgUrl: universe.imgUrl,
      }))
    );
  }, [data]);

  function handleMenuButtonClick() {
    setMenuOpen((prev) => !prev);
  }

  return (
    <div className="home-page">
      <header>
        <nav className="navbar">
          <div className="wrapper">
            <Link to={"/"} className="logo">
              FRANCHISER
            </Link>
            {user ? (
              <div className="user-menu">
                <div
                  className="user-menu-button"
                  onClick={handleMenuButtonClick}
                >
                  <p className="username">{user.name}</p>
                  <img className="user-icon" src={UserIcon} alt="" />
                </div>
                <div
                  className="user-menu-list"
                  style={{ transform: menuOpen ? "" : "translate(0, -100%)" }}
                >
                  <p className="profile-button">Profile</p>
                  <p className="sign-out-button" onClick={() => logout()}>
                    Sign Out
                  </p>
                </div>
              </div>
            ) : (
              <SignInButton></SignInButton>
            )}
          </div>
        </nav>
        <div className="wrapper">
          <section className="hero">
            <h1>Explore Spectacular New Worlds</h1>
          </section>
        </div>
      </header>
      <main>
        <div className="wrapper">
          <section className="content-list">
            {universes.map((universe) => (
              <UniverseBlock
                key={universe.id}
                universe={universe}
              ></UniverseBlock>
            ))}
          </section>
        </div>
      </main>
      <footer className="footer">
        <div className="wrapper">
          <p>&copy; 2024 HarperVenom</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
