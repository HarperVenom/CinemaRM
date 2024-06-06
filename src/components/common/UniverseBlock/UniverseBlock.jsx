import { Link } from "react-router-dom";
import "./universeBlock.css";

const UniverseBlock = ({ universe }) => {
  function getDuration(totalMinutes) {
    const hours = parseInt(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours > 0 ? hours + "h " : ""}${minutes}m`;
  }

  return (
    <Link to={"/" + universe.id} className="universe-link">
      <img className="back-color" src={universe.imgUrl} alt="" />
      <img className="image" src={universe.imgUrl} alt="" />
      <div className="info-shade"></div>
      <div className="info">
        <h2>{universe.title}</h2>
        <div className="details">
          <p className="duration">Duration: {getDuration(universe.duration)}</p>
          <p>Number of Titles: {universe.number}</p>
        </div>
      </div>
    </Link>
  );
};

export default UniverseBlock;
