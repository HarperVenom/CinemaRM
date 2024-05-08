import { useContext, useEffect, useState } from "react";
import { ElementsContext } from "./Map";

export default Element = ({ item, style, onClick }) => {
  const [location, setLocation] = useState(null);
  const [parents, setParents] = useState([]);
  const [trails, setTrails] = useState([]);
  const elements = useContext(ElementsContext);

  useEffect(() => {
    if (!style) return;
    setLocation({
      left: getX(item.xLevel),
      top: getY(item.yLevel),
    });

    const parentsIds = item.watchAfter;
    if (parentsIds.length === 0) return;
    let parents = [];
    parentsIds.forEach((id) => {
      const parent = elements.find((element) => element.id === id);
      parents.push(parent);
    });
    setParents(parents);
  }, [item]);

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
        x: location.left,
        y: location.top + style.height / 2,
      };
      const end = {
        x: parent.left + style.width,
        y: parent.top + style.height / 2,
      };

      const relativeEnd = {
        x: end.x - start.x,
        y: end.y - start.y,
      };

      const yShift =
        Math.sign(start.y - end.y) *
        Math.min(Math.abs(0.05 * (start.y - end.y)), 0.18 * style.height);

      const trail = {
        type: "path",
        d: calculatePathD(
          relativeEnd,
          parent.type,
          yShift,
          item.type === "line-filler" || parent.type === "line-filler"
            ? false
            : true
        ),
      };

      setTrails((prev) => [...prev, trail]);
      trailsCount++;
    });
    if (!location) return;
    if (trailsCount === 0) return;
    const fillerLine = {
      type: "line",
      x1: 0,
      y1: 0,
      x2: style.width,
      y2: 0,
    };

    setTrails((prev) => [...prev, fillerLine]);
  }

  function calculatePathD(end, parentType, yShift, spread = true) {
    return `M ${item.type === "line-filler" ? 0 : 10}
          ${item.type === "line-filler" ? 0 : -yShift} c 

          ${-0.5 * style.width} 
          ${0} 
          
          ${end.x + 0.5 * style.width} 
          ${
            item.type === "line-filler"
              ? parentType === "filler"
                ? end.y
                : end.y + yShift
              : parentType === "filler"
              ? end.y + yShift
              : end.y + 2 * yShift
          } 

          ${
            end.x -
            (() => {
              if (item.type === "line-filler") {
                if (parentType === "filler") return 0;
                else return 10;
              } else if (parentType === "filler") return 10;
              else return 20;
            })()
          } 
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
            transform: `translate(${location.left}px, ${location.top}px)`,
            width: `${style.width}px`,
            height: `${style.height}px`,
            fontSize: style.height / 2.5,
            zIndex: isNaN(item.xLevel)
              ? "unset"
              : -item.xLevel + (item.active ? 1 : 0),
          }}
        >
          <div
            id={item.id}
            className={`element${item.type === "line-filler" ? " filler" : ""}${
              item.active ? " active" : ""
            }${item.type === "series" ? " series" : ""}${
              item.id === -1 ? " universe" : ""
            }`}
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
            {trails.map((trail, index) =>
              trail.type === "path" ? (
                <path
                  key={index}
                  className={"trail " + (item.active === true ? "active" : "")}
                  d={trail.d}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="5px"
                  fill="none"
                ></path>
              ) : (
                <line
                  key={index}
                  className={"trail " + (item.active === true ? "active" : "")}
                  x1={trail.x1}
                  y1={trail.y1}
                  x2={trail.x2}
                  y2={trail.y2}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="5px"
                  fill="none"
                ></line>
              )
            )}
          </svg>
        </div>
      ) : null}
    </>
  );
};
