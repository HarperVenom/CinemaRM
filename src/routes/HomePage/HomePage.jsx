import { useEffect, useState } from "react";
import useApi from "@/utils/useApi";
import "./homePage.css";
import UniverseBlock from "@/components/common/UniverseBlock/UniverseBlock";
import NavBar from "@/components/common/NavBar/NavBar";
import { Helmet } from "react-helmet";

const apiURL = process.env.API_URL;

const HomePage = () => {
  const { data } = useApi(`${apiURL}/api/universes`);
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
      <Helmet>
        <title>CinemaRM</title>
        <meta
          name="description"
          content="Explore cinematic universes and franchises and track your progress with interactive roadmaps"
        />
        <meta
          name="keywords"
          content="movie release order, cinematic universe guide, franchise release roadmap, film release timeline, interactive movie roadmap, movie series guide, film franchise order, cinematic universe release order, movie release tracker, film franchise timeline, movie franchise list, film series roadmap, cinematic universe tracker, movie viewing order, film franchise guide, movie series release dates, movie universe timeline, film series release order, cinematic universe list, movie release schedule"
        />
      </Helmet>
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
            <a href="mailto:harpervenom@gmail.com">
              {" "}
              Contact: harpervenom@gmail.com{" "}
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
