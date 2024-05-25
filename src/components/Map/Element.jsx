import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { UniverseContext } from "../../routes/FranchisePage";
import {
  selectActiveIds,
  selectSelectedId,
} from "../../redux/slices/franchiseSlice";
import "../../styles/element.css";
const MapElement = ({ item, style, onClick, completed }) => {
  const { elements } = useContext(UniverseContext);

  const activeElements = useSelector(selectActiveIds);
  const selected = useSelector(selectSelectedId);

  const [location, setLocation] = useState(null);
  const [parents, setParents] = useState([]);
  const [trails, setTrails] = useState([]);

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
  }, [item, item.yLevel, item.xLevel]);

  function getX(xLevel) {
    return (style.width + style.marginRight) * xLevel;
  }
  function getY(yLevel) {
    return (style.height + style.marginBot) * yLevel;
  }

  useEffect(() => {
    if (item.standAlone) return;
    connectToParents();
  }, [parents]);

  function connectToParents() {
    let trailsCount = 0;

    const newTrails = [];

    const mappedParents = parents
      .filter((parent) => parent !== null)
      .map((parent) => {
        return {
          left: getX(parent.xLevel),
          top: getY(parent.yLevel),
          branch: parent.branch === "line-filler" ? "filler" : "element",
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
        branch: "path",
        d: calculatePathD(
          relativeEnd,
          parent.branch,
          yShift,
          item.branch === "line-filler" || parent.branch === "line-filler"
            ? false
            : true
        ),
      };
      newTrails.push(trail);
      trailsCount++;
    });
    if (!location) return;
    if (trailsCount === 0) return;
    const fillerLine = {
      branch: "line",
      x1: 9,
      y1: 0,
      x2: style.width - 9,
      y2: 0,
    };
    newTrails.push(fillerLine);
    setTrails(newTrails);
  }

  function calculatePathD(end, parentType, yShift, spread = true) {
    return `M ${10}
          ${item.branch === "line-filler" ? 0 : -yShift} c 

          ${-0.5 * style.width} 
          ${0} 
          
          ${end.x + 0.5 * style.width} 
          ${
            item.branch === "line-filler"
              ? parentType === "filler"
                ? end.y
                : end.y + yShift
              : parentType === "filler"
              ? end.y + yShift
              : end.y + 2 * yShift
          } 

          ${end.x - 20} 
          ${
            item.branch === "line-filler"
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
              : -item.xLevel * 2 + (activeElements.includes(item.id) ? 1 : 0),
          }}
        >
          <div
            id={item.id}
            className={`element${
              item.branch === "line-filler" ? " filler" : ""
            }${activeElements.includes(item.id) ? " active" : ""}${
              item.id === -1 ? " universe" : ""
            }${completed ? " completed" : ""}${
              selected === item.id ? " selected" : ""
            }`}
            onClick={() => {
              onClick(item);
            }}
          >
            {item.branch !== "line-filler" && (
              <div className="cover">
                <img className="element-background" src={item.imgUrl} alt="" />
                <p className="title">{item.title}</p>
              </div>
            )}
          </div>

          <svg
            className="trails"
            style={{
              transform: `translate(${0}px, 
          ${-style.height / 2}px)`,
            }}
          >
            {trails.map((trail, index) =>
              trail.branch === "path" ? (
                <path
                  key={index}
                  className={`trail${
                    activeElements.includes(item.id) ? " active" : ""
                  }
                  ${completed ? " completed" : ""}`}
                  d={trail.d}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="5px"
                  fill="none"
                ></path>
              ) : (
                <line
                  key={index}
                  className={`trail${
                    activeElements.includes(item.id) ? " active" : ""
                  }
                  ${completed ? " completed" : ""}`}
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

export default MapElement;