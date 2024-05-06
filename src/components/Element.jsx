import { useEffect, useState } from "react";

export default Element = ({ item, style, onClick, allElements }) => {
  const [location, setLocation] = useState(null);
  const [parents, setParents] = useState([]);
  const [trails, setTrails] = useState([]);

  useEffect(() => {
    if (!style) return;
    setLocation({
      left: `${getX(item.xLevel)}px`,
      top: `${getY(item.yLevel)}px`,
    });

    const parentsIds = item.watchAfter;
    if (parentsIds.length === 0) return;
    let parents = [];
    parentsIds.forEach((id) => {
      const parent = allElements.find((element) => element.id === id);
      parents.push(parent);
    });
    setParents(parents);
  }, [item, style]);

  function getX(xLevel) {
    return (style.width + style.marginRight) * xLevel;
  }
  function getY(yLevel) {
    return (style.height + style.marginBot) * yLevel;
  }

  useEffect(() => {
    if (trails.length >= item.watchAfter.length + 1 || item.standAlone) return;
    connectToParents();
  }, [parents]);

  function connectToParents() {
    let trailsCount = 0;

    const mappedParents = parents
      .filter((parent) => parent !== null)
      .map((parent) => {
        return {
          left: getX(parent.xLevel),
          top: getY(parent.yLevel),
          type: parent.type === "line-filler" ? "filler" : "element",
        };
      });

    mappedParents.forEach((parent) => {
      const start = {
        x: parseInt(location.left),
        y: parseInt(location.top) + style.height / 2,
      };
      const end = {
        x: parseInt(parent.left) + style.width,
        y: parseInt(parent.top) + style.height / 2,
      };

      const relativeEnd = {
        x: end.x - start.x,
        y: end.y - start.y,
      };

      const yShift =
        Math.sign(start.y - end.y) *
        Math.min(Math.abs(0.05 * (start.y - end.y)), 0.18 * style.height);

      const trail = {
        d: calculatePathD(relativeEnd, parent.type, yShift),
      };

      setTrails((prev) => [...prev, trail]);
      trailsCount++;
    });
    if (!location) return;
    if (trailsCount === 0) return;
    const fillerLine = {
      d: calculatePathD({ x: style.width, y: 0 }, "filler", 0, true),
    };

    setTrails((prev) => [...prev, fillerLine]);
  }

  function calculatePathD(end, parentType, yShift, isFiller = false) {
    return `M ${isFiller ? 0 : 10}
          ${item.type === "line-filler" ? 0 : -yShift} c 

          ${isFiller ? 0 : -0.5 * style.width} 
          ${0} 
          
          ${isFiller ? end.x : end.x + 0.5 * style.width} 
          ${
            item.type === "line-filler"
              ? parentType === "filler"
                ? end.y
                : end.y + yShift
              : parentType === "filler"
              ? end.y + yShift
              : end.y + 2 * yShift
          } 

          ${end.x - (isFiller ? 0 : 20)} 
          ${
            item.type === "line-filler"
              ? parentType === "filler"
                ? end.y
                : end.y + yShift
              : parentType === "filler"
              ? end.y + yShift
              : end.y + 2 * yShift
          }`;
  }

  return (
    <>
      {item.yLevel != undefined && location ? (
        <div
          className="element-container"
          style={{
            transform: `translate(${location.left}, ${location.top})`,
            width: `${style.width}px`,
            height: `${style.height}px`,
            fontSize: style.height / 2.5,
            zIndex: isNaN(item.xLevel) ? "unset" : -item.xLevel,
          }}
        >
          <div
            id={item.id}
            className={`element ${item.type === "line-filler" ? "filler" : ""} 
        ${item.active ? "active" : ""} 
        ${item.type === "series" ? "series" : ""} ${
              item.id === -1 ? "universe" : ""
            }
      `}
            onClick={() => {
              onClick(item);
            }}
          >
            <p className="title">{item.title}</p>
          </div>

          <svg
            className="trails"
            style={{
              transform: `translate(${0}px, 
          ${-style.height / 2}px)`,
            }}
          >
            {trails.map((trail, index) => (
              <path
                key={index}
                className={"trail " + (item.active === true ? "active" : "")}
                d={trail.d}
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="5px"
                fill="none"
              ></path>
            ))}
          </svg>
        </div>
      ) : null}
    </>
  );
};
