import { useEffect, useState } from "react";

const Map = ({ universe }) => {
  const elementWidth = 150;
  const elementMarginRight = 100;
  const elementHeight = 50;
  const elementMarginBot = 50;
  const [branchHeight, setBranchHeight] = useState(0);

  const branch = universe.branches[0];
  const [titles, setTitles] = useState(branch.titles);

  useEffect(() => {
    if (!titles) return;
    let updatedTitles = titles.map((title) => {
      title.xLevel = getXLevel(title.id);
      return title;
    });

    getXLevelsArrays().forEach((xLevel, index) => {
      if (index === 0) {
        xLevel = xLevel.map((title, index) => {
          title.yLevel = index;
          return;
        });
        setBranchHeight(xLevel.length * (elementHeight + elementMarginBot));
        return;
      }
      xLevel = xLevel.map((title) => {
        title.yLevel = getYLevel(title.id);
        return;
      });

      const container = document.querySelector(".trails");
      container.innerHTML = "";
    });

    setTitles(updatedTitles);
  }, []);

  function getXLevelsArrays() {
    let xLevels = [];
    titles.forEach((title) => {
      while (xLevels.length < title.xLevel + 1) {
        xLevels.push([]);
      }
      xLevels[title.xLevel].push(title);
    });
    return xLevels;
  }

  function getXLevel(id) {
    let level = 0;
    let step = titles[id];
    while (step.watchAfter.length !== 0) {
      level++;
      let highestLevelIndex;
      for (let i = 0; i < step.watchAfter.length; i++) {
        if (
          highestLevelIndex != undefined
            ? getXLevel(step.watchAfter[i]) >
              getXLevel(step.watchAfter[highestLevelIndex])
            : true
        )
          highestLevelIndex = i;
      }
      step = titles[step.watchAfter[highestLevelIndex]];
    }
    return level;
  }

  function getYLevel(id) {
    let level = 0;
    const element = titles[id];

    element.watchAfter.forEach((parentId) => {
      level += titles[parentId].yLevel;
    });
    return level / element.watchAfter.length;
  }

  return (
    <div className="map-frame">
      <div className="header">{universe.title}</div>
      <div className="map-container">
        <div className="map">
          <div className="level">
            {titles &&
              titles.map((title) => (
                <Element
                  key={title.id}
                  item={title}
                  style={{
                    width: elementWidth,
                    height: elementHeight,
                    marginRight: elementMarginRight,
                    marginBot: elementMarginBot,
                    branchHeight: branchHeight,
                  }}
                />
              ))}
            <svg className="trails"></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;

const Element = ({ item, style, active }) => {
  const [location, setLocation] = useState(null);
  const [parents, setParents] = useState([]);
  const [trails, setTrails] = useState([]);
  // const [active, setActive] = useState(false);

  useEffect(() => {
    if (style.branchHeight === 0) return;
    setLocation({
      left: `${(style.width + style.marginRight) * item.xLevel}px`,
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
    // container.innerHTML = "";
    parents
      .map((parent) => {
        return { left: parent.style.left, top: parent.style.top };
      })
      .forEach((parentLocation) => {
        if (!parentLocation.left || !parentLocation.top) return;
        //<path id="lineAC" d="M 100 350 q -50 -100 100 -100"
        //stroke="blue" fill="none" stroke-width="4"/>
        const path = document.createElementNS(SVG_NS, "path");
        const start = {
          x: parseInt(location.left) + 10,
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

        // const points = [
        //   { x: start.x, y: start.y },
        //   { x: start.x - 30, y: start.y },
        //   { x: start.x - 40, y: start.y - 10 },
        //   { x: end.x, y: end.y },
        // ];

        // const pathString = points.reduce((acc, point, index, arr) => {
        //   if (index === 0) {
        //     return `M ${point.x} ${point.y}`;
        //   } else if (index === 1) {
        //     // First control point
        //     const cx1 = arr[index - 1].x + (point.x - arr[index - 1].x) / 3;
        //     const cy1 = arr[index - 1].y + (point.y - arr[index - 1].y) / 3;
        //     // Second control point
        //     const cx2 = point.x - (arr[index + 1].x - point.x) / 3;
        //     const cy2 = point.y - (arr[index + 1].y - point.y) / 3;
        //     return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${point.x} ${point.y}`;
        //   } else if (index === arr.length - 1) {
        //     // Last point, no need for control points
        //     return `${acc} L ${point.x} ${point.y}`;
        //   } else {
        //     // Calculate control points based on previous and next points
        //     const cx1 = arr[index - 1].x + (point.x - arr[index - 1].x) / 3;
        //     const cy1 = arr[index - 1].y + (point.y - arr[index - 1].y) / 3;
        //     const cx2 = point.x - (arr[index + 1].x - point.x) / 3;
        //     const cy2 = point.y - (arr[index + 1].y - point.y) / 3;
        //     return `${acc} S ${cx1} ${cy1}, ${point.x} ${point.y}`;
        //   }
        // }, "");

        // path.setAttribute("d", pathString);

        path.setAttribute(
          "d",
          `M ${start.x}
          ${start.y} c ${-style.marginRight / 2} ${0} ${
            relativeEnd.x + style.marginRight / 2
          } ${relativeEnd.y} ${relativeEnd.x} ${relativeEnd.y}`
        );
        path.setAttribute("stroke", "rgba(255, 255, 255, 0.2)");
        path.setAttribute("stroke-width", "3px");
        path.setAttribute("fill", "none");

        // const line = document.createElementNS(SVG_NS, "line");
        // line.setAttribute("x1", parseInt(location.left) + 10);
        // line.setAttribute("y1", parseInt(location.top) + style.height / 2);
        // line.setAttribute("x2", parseInt(parentLocation.left) + style.width);
        // line.setAttribute(
        //   "y2",
        //   parseInt(parentLocation.top) + style.height / 2
        // );
        // line.setAttribute("stroke", "white");

        // setTrails((prev) => [...prev, line]);
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
