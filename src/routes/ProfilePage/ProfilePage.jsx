import NavBar from "@/components/common/NavBar/NavBar";
import "./profilePage.css";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "@/GlobalState";
import useApi from "@/utils/useApi";
import { Link } from "react-router-dom";

const apiURL = process.env.API_URL;

const ProfilePage = () => {
  const { user, completed } = useContext(GlobalContext);
  const [completedUniverses, setCompletedUniverses] = useState([]);
  const { data: universes } = useApi(`${apiURL}/api/universes`);

  useEffect(() => {
    if (!user || !completed || !universes) return;

    const completedUniverses = [];

    completed.forEach((universe) => {
      const completedUniverse = {};
      const currentUniverse = universes.find(
        (currentUniverse) => universe.universeId === currentUniverse.id
      );
      const totalNumber = currentUniverse.number;
      const completedNumber = universe.titles.length;
      const progress = Math.floor((completedNumber / totalNumber) * 100);

      completedUniverse.id = currentUniverse.id;
      completedUniverse.title = currentUniverse.title;
      completedUniverse.progress = progress;

      completedUniverses.push(completedUniverse);
    });
    setCompletedUniverses(completedUniverses);
  }, [completed, universes]);

  return (
    <>
      <div className="profile-page">
        <NavBar position={"relative"}></NavBar>

        <div className="profile">
          <div className="wrapper">
            <h1>Profile</h1>
            {user ? (
              <section className="progress-section">
                <h2>Your progress:</h2>
                {completedUniverses.map((universe, index) => (
                  <Link
                    to={`/${universe.id}`}
                    key={universe.title}
                    className="universe-bar"
                  >
                    <div className="title">{`${
                      index + 1 + ". " + universe.title
                    }`}</div>
                    <div className="progress">
                      <div
                        className="bar"
                        style={{
                          background: `linear-gradient(to right, var(--text) ${universe.progress}%, var(--normal) ${universe.progress}%)`,
                        }}
                      >
                        <div className="percent">{`${universe.progress}%`}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </section>
            ) : (
              <p>Log in to your account to store and see the progress.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
