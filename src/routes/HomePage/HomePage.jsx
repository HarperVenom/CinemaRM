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
      }))
    );
  }, [data]);

  return (
    <div className="home-page">
      <header>
        <NavBar></NavBar>
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
