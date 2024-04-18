import { useEffect, useState } from "react";

const Map = ({ universe }) => {
  const elementWidth = 150;
  const elementMarginRight = 100;
  const elementHeight = 50;
  const elementMarginBot = 40;
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

const Level = ({ items, elementStyle }) => {
  return (
    <div className="level">
      {items.map((item) => (
        <Element key={item.id} item={item} style={elementStyle} />
      ))}
    </div>
  );
};

const Element = ({ item, style }) => {
  const [location, setLocation] = useState(null);
  const [parentsLocations, setParentsLocations] = useState([]);

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
    const parentsLocations = parentsIds.map((id) => {
      const element = document.getElementById(id);
      // console.log(element);
      return { left: element.style.left, top: element.style.top };
    });
    // console.log(parentsLocations);
    setParentsLocations(parentsLocations);
  }, [item, style]);

  useEffect(() => {
    const SVG_NS = "http://www.w3.org/2000/svg";
    const container = document.querySelector(".trails");
    parentsLocations.forEach((parentLocation) => {
      if (!parentLocation.left || !parentLocation.top) return;
      // console.log(parentLocation);
      console.log(parseInt(location.top));
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", parseInt(location.left) + 10);
      line.setAttribute("y1", parseInt(location.top) + style.height / 2);
      line.setAttribute("x2", parseInt(parentLocation.left) + style.width);
      line.setAttribute("y2", parseInt(parentLocation.top) + style.height / 2);
      line.setAttribute("stroke", "white");

      container.appendChild(line);
    });
  }, [parentsLocations]);

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
        console.log(location.left, location.top);
      }}
    >
      <p className="title">{item.title}</p>
    </div>
  );
};
