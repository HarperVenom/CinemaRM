import { useEffect } from "react";

const MapHeading = ({ title }) => {
  useEffect(() => {
    console.log(title);
  }, []);
  return title ? (
    <div className="heading">
      <img src={title.img_url} alt="" />
      <div className="title">{title.title}</div>
    </div>
  ) : null;
};

export default MapHeading;
