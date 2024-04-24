import { useEffect, useState } from "react";

export default Element = ({ item, style, active }) => {
  const [location, setLocation] = useState(null);
  const [parents, setParents] = useState([]);
  const [trails, setTrails] = useState([]);
  // const [active, setActive] = useState(false);

  useEffect(() => {
    if (style.branchHeight === 0) return;
    setLocation({
      left: `${
        (style.width + style.marginRight) * item.xLevel
        //+ 10 * item.x
      }px`,
      top: `${(style.height + style.marginBot) * item.yLevel}px`,
    });

    const parentsIds = item.watchAfter;
    if (parentsIds.length === 0) return;
    let parents = [];
    parentsIds.forEach((id) => {
      const element = document.getElementById(id);
      parents.push(element);
    });
    setParents(parents);
  }, [item, style]);

  useEffect(() => {
    const SVG_NS = "http://www.w3.org/2000/svg";
    const container = document.querySelector(".trails");

    if (trails.length === item.watchAfter.length || item.standAlone) return;
    parents
      .filter((parent) => parent !== null)
      .map((parent) => {
        return {
          left: parent.style.left,
          top: parent.style.top,
          type: parent.classList.contains("filler") ? "filler" : "element",
        };
      })
      .forEach((parentLocation) => {
        if (!parentLocation.left || !parentLocation.top) return;
        const path = document.createElementNS(SVG_NS, "path");
        const start = {
          x: parseInt(location.left),
          y: parseInt(location.top) + style.height / 2,
        };
        const end = {
          x: parseInt(parentLocation.left) + style.width,
          y: parseInt(parentLocation.top) + style.height / 2,
        };
        const relativeEnd = {
          x: end.x - start.x,
          y: end.y - start.y,
        };

        const shiftStart =
          Math.sign(start.y - end.y) *
          Math.min(Math.abs(0.05 * (start.y - end.y)), 0.18 * style.height);

        path.setAttribute(
          "d",
          `M ${start.x}
          ${item.type === "line-filler" ? start.y : start.y - shiftStart} c 

          ${-0.5 * style.width} 
          ${0} 
          
          ${relativeEnd.x + 0.5 * style.width} 
          ${
            item.type === "line-filler"
              ? parentLocation.type === "filler"
                ? relativeEnd.y
                : relativeEnd.y + shiftStart
              : parentLocation.type === "filler"
              ? relativeEnd.y + shiftStart
              : relativeEnd.y + 2 * shiftStart
          } 

          ${relativeEnd.x} 
          ${
            item.type === "line-filler"
              ? parentLocation.type === "filler"
                ? relativeEnd.y
                : relativeEnd.y + shiftStart
              : parentLocation.type === "filler"
              ? relativeEnd.y + shiftStart
              : relativeEnd.y + 2 * shiftStart
          }`
        );
        path.setAttribute("stroke", "rgba(255, 255, 255, 0.5)");
        path.setAttribute("stroke-width", "3px");
        path.setAttribute("fill", "none");

        setTrails((prev) => [...prev, path]);
        container.appendChild(path);
      });
    if (!location) return;
    const path = document.createElementNS(SVG_NS, "line");
    path.setAttribute("x1", parseInt(location.left));
    path.setAttribute("y1", parseInt(location.top) + style.height / 2);
    path.setAttribute("x2", parseInt(location.left) + style.width);
    path.setAttribute("y2", parseInt(location.top) + style.height / 2);

    path.setAttribute("stroke", "rgba(255, 255, 255, 0.5)");
    path.setAttribute("stroke-width", "3px");
    container.appendChild(path);
  }, [parents]);

  useEffect(() => {
    // onClick();
    // console.log("hey " + item.id);
    trails.forEach((trail) => {
      if (active) trail.classList.add("active");
      else trail.classList.remove("active");
    });
  }, [active]);

  return (
    <div
      id={item.id}
      className={"element " + (item.type === "line-filler" ? "filler" : "")}
      style={
        item.yLevel != undefined && location
          ? {
              left: location.left,
              top: location.top,
              width: style.width,
              height: `${style.height}px`,
            }
          : null
      }
      onClick={() => {
        console.log(item.yLevel);
        // parents.forEach((parent) => {
        //   parent.click();
        // });
      }}
    >
      <p className="title">{item.title}</p>
    </div>
  );
};
