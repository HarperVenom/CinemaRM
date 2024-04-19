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
        const yLevel = getYLevel(title.id);

        title.yLevel = yLevel;
        return title;
      });
      let currentYLevels = [];
      xLevel.forEach((title) => {
        currentYLevels.push(title.yLevel);
      });
      let bunches = [];
      // while ()

      const bunch = elementsIntersect(xLevel);
      if (bunch) {
        bunches.push(bunch);
      }

      console.log(bunches.length > 0 ? bunches : null);

      bunches.forEach((bunch) => {
        const bunchHeight = bunch.length * (elementHeight + elementMarginBot);
        const midPoint =
          bunch.reduce((acc, title) => (acc += title.yLevel), 0.0) /
          bunch.length;
        console.log(Math.floor(bunch.length / 2));
        console.log("midpoint " + midPoint);
        let startingPoint = midPoint - Math.floor(bunch.length / 2);
        bunch.forEach((title) => {
          title.yLevel = startingPoint;
          console.log(title.yLevel);
          startingPoint++;
        });
      });

      const container = document.querySelector(".trails");
      container.innerHTML = "";
    });

    setTitles(updatedTitles);
  }, []);

  function elementsIntersect(xLevel) {
    for (let i = 0; i < xLevel.length; i++) {
      const currentYLevel = xLevel[i];
      // console.log(currentYLevel);
      const bunch = [
        currentYLevel,
        ...xLevel.filter((title, index) => {
          if (index === i) return false;
          const rangeStart = currentYLevel.yLevel;
          const rangeEnd = currentYLevel.yLevel + 1;
          if (title.yLevel >= rangeStart && title.yLevel < rangeEnd)
            return true;
        }),
      ];

      if (bunch.length > 1) {
        return bunch;
      }
    }
    return false;
  }

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
