import { useEffect, useState } from "react";
import Element from "./Element";

const Map = ({ universe }) => {
  const scale = 1;
  const elementWidth = 150 * scale;
  const elementMarginRight = 200 * scale;
  const elementHeight = 50 * scale;
  const elementMarginBot = 60 * scale;
  const [branchHeight, setBranchHeight] = useState(0);
  const [firstXLevelHeight, setfirstXLevelHeight] = useState(0);

  const branch = universe.branches[0];
  const titles = branch.titles;
  const [elements, setElements] = useState(
    []
    // branch.titles
  );

  useEffect(() => {
    if (!titles) return;

    titles.forEach((title) => {
      if (title.xLevel) return title;
      title.xLevel = getXLevel(title.id);
      return title;
    });

    titles.forEach((title) => {
      const parents = title.watchAfter.map((parentId) => {
        return titles.find((title) => title.id === parentId);
      });

      let lastParent = null;
      parents.forEach((parent) => {
        if (parent === undefined) return;

        const leftCorner =
          title.xLevel > parent.xLevel ? parent.xLevel : title.xLevel;
        const rightCorner =
          leftCorner === title.xLevel ? parent.xLevel : title.xLevel;

        const xDifference = rightCorner - leftCorner;

        if (xDifference === 1) return;

        for (let x = 1; x < xDifference; x++) {
          titles.push({
            id: parent.id + "-" + title.id + "-x" + x,
            type: "line-filler",
            xLevel: leftCorner + x,
            watchAfter: [
              lastParent === null || lastParent !== parent
                ? parent.id
                : titles[titles.length - 1].id,
            ],
          });
          lastParent = parent;
        }
        title.watchAfter = [
          ...title.watchAfter.filter((id) => id !== parent.id),
          titles[titles.length - 1].id,
        ];
      });
    });

    getXLevelsArrays().forEach((level, index) => {
      let levelHeight = getLevelHeight(level);
      if (index === 0) {
        level.forEach((title, index) => {
          title.yLevel = index - levelHeight / 2;
        });
        return;
      }
      const previousLevel = getXLevelsArrays()[index - 1];
      const previousHeight = getLevelHeight(previousLevel);

      const sortedLevel = sortTitles(level);
      sortedLevel.forEach((title, index) => {
        title.yLevel =
          index - levelHeight / 2 + (previousLevel.length - previousHeight) / 2;
      });
    });

    setfirstXLevelHeight(
      getXLevelsArrays()[0].length * (elementHeight + elementMarginBot)
    );

    let highestTitle;
    let lowestTitle;
    titles.forEach((title) => {
      if (!highestTitle) {
        highestTitle = title;
        return;
      }
      if (!lowestTitle) {
        lowestTitle = title;
        return;
      }

      if (title.yLevel < highestTitle.yLevel) highestTitle = title;
      else if (title.yLevel > lowestTitle.yLevel) {
        lowestTitle = title;
      }
    });
    const mapHeight = lowestTitle.yLevel - highestTitle.yLevel;

    setBranchHeight(mapHeight * (elementHeight + elementMarginBot));

    setElements(titles);
  }, []);

  function sortTitles(level) {
    let initialArray = level;
    let sortedArray = [];

    initialArray.forEach((title) => {
      title.yLevel = getParentsYLevel(title);
    });

    while (initialArray.length > 0) {
      let highestTitle = initialArray[0];

      initialArray.forEach((title) => {
        if (title.yLevel === highestTitle.yLevel) {
          if (
            title.type === "line-filler" &&
            highestTitle.type !== "linne-filler"
          ) {
            highestTitle = title;
            return;
          }
        }
        if (title.yLevel < highestTitle.yLevel) highestTitle = title;
      });

      highestTitle.yLevel = undefined;
      sortedArray.push(highestTitle);
      initialArray = initialArray.filter((title) => title != highestTitle);
    }
    const savedArray = sortedArray;
    savedArray.forEach((title, index) => {
      if (title.standAlone) {
        const length = sortedArray.length;
        sortedArray = sortedArray.filter((element) => element != title);
        if (index >= length / 2) {
          sortedArray.push(title);
        } else {
          sortedArray.unshift(title);
        }
      }
    });

    return sortedArray;

    function getParentsYLevel(title) {
      return title.watchAfter.reduce((acc, parentId) => {
        const parent = titles.find((title) => title.id === parentId);
        acc += parent.yLevel;
        return acc;
      }, 0);
    }
  }

  function getLevelHeight(level) {
    let height = 0;
    level.forEach((title) => {
      if (title.xLevel === 0) {
        height++;
        return;
      }
      if (!title.standAlone) height++;
    });
    return height;
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
    let step = titles.find((title) => title.id === id);

    if (step === undefined) return;
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
            {elements &&
              elements.map((title) => (
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
