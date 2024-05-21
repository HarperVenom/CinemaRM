import { useEffect, useState } from "react";
import useFetch from "../utils/useFetch";
import { Link } from "react-router-dom";
import "../styles/homePage.css";
import UniverseBlock from "../components/common/UniverseBlock";

const HomePage = () => {
  const [universesData, loading, error] = useFetch("/api/universes");
  const [universes, setUniverses] = useState([]);

  useEffect(() => {
    if (!universesData) return;
    setUniverses(
      universesData.map((universe) => ({
        id: universe.id,
        title: universe.title,
        img_url: universe.img_url,
      }))
    );
    // console.log(universes);
  }, [universesData]);

  return (
    <div className="homepage">
      <header>
        <nav className="navbar">
          <div className="wrapper">
            <Link to={"/"} className="logo">
              FRANCHISER
            </Link>
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
