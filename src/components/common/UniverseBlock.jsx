import { Link } from "react-router-dom";
import "../../styles/universeBlock.css";

const UniverseBlock = ({ universe }) => {
  function handleUniverseCLick() {}

  return (
    <Link to={"/" + universe.id} className="universe-link">
      <img src={universe.img_url} alt="" />
      <div className="info">
        <h2>{universe.title}</h2>
      </div>
    </Link>
  );
};

export default UniverseBlock;
