import { useEffect, useState } from "react";
import Element from "./Element";

const Map = ({ universe }) => {
  const scale = 1;
  const elementWidth = 150 * scale;
  const elementMarginRight = 100 * scale;
  const elementHeight = 50 * scale;
  const elementMarginBot = 40 * scale;
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

    titles.forEach((title) => {
      title.x = getXShift(title.id);
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
      while (elementsIntersect(xLevel)) {
        let currentXLevelBunches = elementsIntersect(xLevel);

        //Sorts elements in bunches by highest Y level to arrange properly
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

          //Shift elements that are single on an x level but are not the only children of its parents.
          titles.forEach((title) => {
            const children = getChildren(title.id);
            const closestChildren = children.filter(
              (child) => child.xLevel === title.xLevel + 1
            );

            if (
              closestChildren.length === 0 ||
              closestChildren.length === children.length
            )
              return;

            let averageClosestChildrenY =
              closestChildren.reduce((acc, child) => (acc += child.yLevel), 0) /
              closestChildren.length;

            let otherChildren = children.filter(
              (child) => !closestChildren.includes(child)
            );

            let averageOtherChildrenY =
              otherChildren.reduce((acc, child) => (acc += child.yLevel), 0) /
              otherChildren.length;

            const distance = Math.abs(
              averageClosestChildrenY - averageOtherChildrenY
            );

            if (distance > 1.5) return;

            closestChildren.forEach((child) => {
              if (averageClosestChildrenY < averageOtherChildrenY) {
                child.yLevel -= 0.7 * distance;
              } else {
                child.yLevel += 0.7 * distance;
              }
            });
          });
        });
      }

      const container = document.querySelector(".trails");
      container.innerHTML = "";
    });
    setBranchHeight(branchHeight);
    setTitles(updatedTitles);
  }, []);

  function getXShift(id) {
    const element = titles[id];
    const years = titles.map((title) => {
      const date = new Date(title.release);
      return date.getFullYear();
    });
    const firstYear = Math.min(...years);
    const date = new Date(element.release);

    let xShift = 0;
    let skips = 0;
    titles.forEach((title) => {
      const currentDate = new Date(title.release);
      if (date.getFullYear() > currentDate.getFullYear()) {
        xShift++;
      } else if (
        date.getFullYear() === currentDate.getFullYear() &&
        date.getMonth() > currentDate.getMonth()
      ) {
        xShift++;
      } else if (
        date.getFullYear() === currentDate.getFullYear() &&
        date.getMonth() === currentDate.getMonth() &&
        date.getDate() > date.getDate()
      )
        xShift++;
    });

    // const xShift =
    //   0.1 * (date.getFullYear() - firstYear + 0.08 * date.getMonth());
    //  +
    // 0.1 * date.getMonth() +
    // 0.01 * date.getDate();
    // console.log(titles[id].title, xShift);
    return xShift - skips;
  }

  function getChildren(id) {
    let kids = [];
    titles.forEach((title) => {
      if (title.watchAfter.includes(id)) kids.push(title);
    });
    return kids;
  }

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
    // const element = titles[id];
    // const years = titles.map((title) => {
    //   const date = new Date(title.release);
    //   return date.getFullYear();
    // });
    // const firstYear = Math.min(...years);
    // const date = new Date(element.release);
    // level = date.getFullYear() - firstYear;
    // console.log(level);
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
