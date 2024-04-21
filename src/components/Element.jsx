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
        (style.width + style.marginRight) * item.xLevel + 10 * item.x
        // (style.width + style.marginRight) * item.x
      }px`,
      top: `${
        (style.height + style.marginBot) * item.yLevel - style.branchHeight / 2
      }px`,
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
      .map((parent) => {
        return { left: parent.style.left, top: parent.style.top };
      })
      .forEach((parentLocation) => {
        if (!parentLocation.left || !parentLocation.top) return;
        const path = document.createElementNS(SVG_NS, "path");
        const start = {
          x: parseInt(location.left) + 10,
          y: parseInt(location.top) + style.height / 2,
        };
        const end = {
          x: parseInt(parentLocation.left) + style.width - 10,
          y: parseInt(parentLocation.top) + style.height / 2,
        };
        const relativeEnd = {
          x: end.x - start.x,
          y: end.y - start.y,
        };

        const xDistance = start.x - end.x;

        const shiftStart =
          Math.sign(start.y - end.y) *
          Math.min(Math.abs(0.05 * (start.y - end.y)), 0.18 * style.height);

        path.setAttribute(
          "d",
          `M ${start.x}
          ${start.y - shiftStart} c ${-xDistance / 4} ${0} ${
            relativeEnd.x + xDistance / 4
          } ${relativeEnd.y} ${relativeEnd.x} ${relativeEnd.y + 2 * shiftStart}`
        );
        path.setAttribute("stroke", "rgba(255, 255, 255, 0.2)");
        path.setAttribute("stroke-width", "3px");
        path.setAttribute("fill", "none");

        setTrails((prev) => [...prev, path]);
        container.appendChild(path);
      });
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
      className="element"
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
        // setActive((prev) => !prev);
        // console.log(location.left, location.top);
        // console.log(trails);
        // console.log(parents);
        parents.forEach((parent) => {
          parent.click();
        });
      }}
    >
      <p className="title">{item.title}</p>
    </div>
  );
};
