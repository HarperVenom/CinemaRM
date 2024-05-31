import { GlobalContext } from "@/GlobalState";
import { useContext, useEffect, useState } from "react";
import UserIcon from "@/assets/user.svg";
import { Link } from "react-router-dom";
import SignInButton from "../SignInButton";
import "./navbar.css";

const NavBar = ({ forceClose }) => {
  const { user, logout } = useContext(GlobalContext);
  const [menuOpen, setMenuOpen] = useState(false);

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
  return (
    <>
      <div
        className={`screen-cover${menuOpen ? " visible" : ""}`}
        onClick={() => setMenuOpen(false)}
      ></div>
      <nav className="navbar">
        <div className="wrapper">
          <div className="nav-cover"></div>
          <Link to={"/"} className="logo">
            FRANCHISER
          </Link>
          {user ? (
            <div className={`user-menu${menuOpen ? " opened" : ""}`}>
              <div className="user-menu-button" onClick={handleMenuButtonClick}>
                <p className="username">{user.name}</p>
                <img className="user-icon" src={user.picture} alt="" />
              </div>
              <div
                className="user-menu-list"
                style={{ transform: menuOpen ? "" : "translate(0, -100%)" }}
              >
                <Link className="button hover">Profile</Link>
                <p className="button hover" onClick={() => logout()}>
                  Sign Out
                </p>
              </div>
            </div>
          ) : (
            <SignInButton></SignInButton>
          )}
        </div>
      </nav>
    </>
  );
};

export default NavBar;
