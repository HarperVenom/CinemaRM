import NavBar from "@/components/common/NavBar/NavBar";
import "./profilePage.css";
import { useContext } from "react";
import { GlobalContext } from "@/GlobalState";

const ProfilePage = () => {
  const { user } = useContext(GlobalContext);
  return (
    <>
      <div className="profile-page">
        <NavBar></NavBar>
        {user ? (
          <div className="profile">
            <div className="wrapper">
              <h1>Profile</h1>
              <section className="progress-section">
                <h2>Your progress:</h2>
              </section>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default ProfilePage;
