import { forwardRef, useEffect, useRef } from "react";

const MapHeading = forwardRef(function MapHeading(props, headingRef) {
  const { title, frameRef } = props;

  return title ? (
    <div className="heading" ref={headingRef}>
      <img src={title.img_url} alt="" />
      <div className="info">
        <div className="title">{title.title}</div>
        <div className="description">{title.description}</div>
      </div>
    </div>
  ) : null;
});

export default MapHeading;
