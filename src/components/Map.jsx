import { useEffect, useState } from "react";

const Map = ({ universe }) => {
  const elementWidth = 150;
  const elementMarginRight = 100;
  const elementHeight = 50;
  const elementMarginBot = 50;
  const [branchHeight, setBranchHeight] = useState(0);
  const [firstXLevelHeight, setfirstXLevelHeight] = useState(0);

  const branch = universe.branches[0];
  const [titles, setTitles] = useState(branch.titles);

  useEffect(() => {
    if (!titles) return;
    let updatedTitles = titles.map((title) => {
      title.xLevel = getXLevel(title.id);
      return title;
    });

    let branchHeight = 0;
    getXLevelsArrays().forEach((xLevel, index) => {
      if (index === 0) {
        xLevel = xLevel.map((title, index) => {
          title.yLevel = index;
          return;
        });
        branchHeight = xLevel.length * (elementHeight + elementMarginBot);
        setfirstXLevelHeight(branchHeight);
        return;
      }
      xLevel = xLevel.map((title) => {
        const yLevel = getYLevel(title.id);

        title.yLevel = yLevel;
        return title;
      });

      const newBranchHeight =
        xLevel.length * (elementHeight + elementMarginBot);
      branchHeight =
        newBranchHeight > branchHeight ? newBranchHeight : branchHeight;

      let currentYLevels = [];
      xLevel.forEach((title) => {
        currentYLevels.push(title.yLevel);
      });
      let bunches = [];

      //Groups elements that are too close to each other into separate bunches
      let currentXLevelBunches = elementsIntersect(xLevel);

      //Sorts elements in bunches by its initial Y level to arrange properly
      if (currentXLevelBunches) {
        currentXLevelBunches.forEach((bunch) => {
          let sortedByLevel = [];
          while (bunch.length > 0) {
            let highest = 0;
            for (let i = 1; i < bunch.length; i++) {
              if (bunch[i].yLevel < bunch[highest].yLevel) highest = i;
            }
            sortedByLevel.push(bunch[highest]);
            bunch = bunch.filter((_, index) => index !== highest);
          }

          bunches.push(sortedByLevel);
        });
      }
      //Assigns new corrected Y levels to all elements in bunches
      bunches.forEach((bunch) => {
        const midPoint =
          bunch.reduce((acc, title) => (acc += title.yLevel), 0.0) /
          bunch.length;
        let startingPoint = midPoint - bunch.length / 2 + 0.5;
        bunch.forEach((title) => {
          title.yLevel = startingPoint;
          startingPoint++;
        });
      });

      const container = document.querySelector(".trails");
      container.innerHTML = "";
    });
    setBranchHeight(branchHeight);
    setTitles(updatedTitles);
  }, []);

  function elementsIntersect(xLevel) {
    let bunches = [];
    for (let i = 0; i < xLevel.length; i++) {
      const currentYLevel = xLevel[i];
      let canContinue = true;
      bunches.forEach((bunch) => {
        if (bunch.includes(currentYLevel)) canContinue = false;
      });
      if (!canContinue) continue;
      let increaseRange = false;

      const bunch = [
        currentYLevel,
        ...xLevel.filter((title, index) => {
          if (index === i) return false;
          const rangeStart = increaseRange
            ? currentYLevel.yLevel - 1
            : currentYLevel.yLevel;
          const rangeEnd = increaseRange
            ? currentYLevel.yLevel + 2
            : currentYLevel.yLevel + 1;
          if (title.yLevel >= rangeStart && title.yLevel < rangeEnd) {
            increaseRange = true;
            return true;
          }
        }),
      ];

      if (bunch.length > 1) {
        bunches.push(bunch);
      }
    }
    if (bunches.length > 0) {
      console.log(bunches);
      return bunches;
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

  useEffect(() => {
    if (branchHeight === 0) return;
    document.querySelector(".map").style.minHeight = branchHeight + "px";
  }, [branchHeight]);

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
                    branchHeight: firstXLevelHeight,
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
