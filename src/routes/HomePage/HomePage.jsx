import { useContext, useEffect, useState } from "react";
import useApi from "@/utils/useApi";
import "./homePage.css";
import UniverseBlock from "@/components/common/UniverseBlock/UniverseBlock";
import { backendUrl } from "@/config";
import NavBar from "@/components/common/NavBar/NavBar";

const HomePage = () => {
  const { data } = useApi(`${backendUrl}/api/universes`);
  const [universes, setUniverses] = useState([]);

  useEffect(() => {
    if (!data) return;
    setUniverses(
      data.map((universe) => ({
        id: universe.id,
        title: universe.title,
        imgUrl: universe.imgUrl,
        duration: universe.duration,
        number: universe.number,
      }))
    );
  }, [data]);

  return (
    <div className="home-page">
      <div className="page-container">
        <header>
          <NavBar position={"absolute"}></NavBar>
          <section className="hero">
            <div className="back-grid"></div>
            <div className="wrapper">
              <h1 className="anton-regular">
                <span className="stick">Explore Spectacular</span>{" "}
                <span className="stick">New Worlds</span>
              </h1>
              <h5 className="merriweather-light">
                Track your progress with interactive roadmaps
              </h5>
            </div>
          </section>
        </header>
        <main>
          <section className="content-list">
            <h3>CHOOSE A UNIVERSE</h3>
            {universes.map((universe) => (
              <UniverseBlock
                key={universe.id}
                universe={universe}
              ></UniverseBlock>
            ))}
            <h4>More are coming...</h4>
          </section>
        </main>
        <footer className="footer">
          <div className="wrapper">
            <p>&copy; 2024 HarperVenom</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
