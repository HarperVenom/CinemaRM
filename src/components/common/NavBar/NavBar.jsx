import { GlobalContext } from "@/GlobalState";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SignInButton from "../SignInButton";
import "./navbar.css";

const NavBar = ({ position, forceClose }) => {
  const { user, logout } = useContext(GlobalContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState();

  useEffect(() => {
    if (user) return;
    setMenuOpen(false);
  }, [user]);

  useEffect(() => {
    if (forceClose) {
      setMenuOpen(false);
    }
  }, [forceClose]);

  function handleMenuButtonClick() {
    setMenuOpen((prev) => !prev);
  }

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", () => {
      setWindowWidth(window.innerWidth);
    });
  }, []);

  return (
    <>
      <div
        className={`screen-cover${menuOpen ? " visible" : ""}`}
        onClick={() => setMenuOpen(false)}
      ></div>
      <nav
        className={`navbar${position ? " " + position : ""}${
          menuOpen ? " opened" : ""
        }${windowWidth < 500 ? " small" : ""}`}
      >
        <div className="wrapper">
          <div className="nav-cover"></div>
          <Link to={"/"} className="logo anton-regular">
            <p>CinemaRM</p>
          </Link>
          {user ? (
            <div className={`user-menu${menuOpen ? " opened" : ""}`}>
              <div className="user-menu-button" onClick={handleMenuButtonClick}>
                <p className="username">{user.name}</p>
                <img className="user-icon" src={user.picture} alt="" />
              </div>
              <div
                className="user-menu-list"
                style={{
                  opacity: menuOpen ? 1 : 0,
                  pointerEvents: menuOpen ? "all" : "none",
                }}
              >
                <Link to={`/profile`} className="button hover">
                  Profile
                </Link>
                <p className="button hover" onClick={() => logout()}>
                  Sign Out
                </p>
              </div>
            </div>
          ) : (
            <SignInButton showButton={true}></SignInButton>
          )}
        </div>
      </nav>
    </>
  );
};

export default NavBar;
