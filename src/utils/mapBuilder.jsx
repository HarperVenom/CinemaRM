import { getAllParentElements } from "./mapFunctionality";

export function getMapElements(oldTitles, filters) {
  const elements = filterElements(oldTitles.map((title) => ({ ...title }))).map(
    (element) => ({ ...element })
  );

  elements.forEach((title, index) => {
    if (title.watchAfter.length === 0 && index !== 0)
      title.watchAfter = [elements[0].id];
  });

  elements.forEach((title) => {
    if (title.xLevel) return title;
    title.xLevel = getXLevel(title.id);
    return title;
  });

  elements.forEach((title) => {
    const parents = title.watchAfter.map((parentId) => {
      return elements.find((title) => title.id === parentId);
    });

    let lastParent = null;
    if (title.standAlone) return;
    parents.forEach((parent) => {
      if (parent === undefined) return;

      const leftCorner =
        title.xLevel > parent.xLevel ? parent.xLevel : title.xLevel;
      const rightCorner =
        leftCorner === title.xLevel ? parent.xLevel : title.xLevel;

      const xDifference = rightCorner - leftCorner;

      if (xDifference === 1) return;
      for (let x = 1; x < xDifference; x++) {
        elements.push({
          id: parent.id + "-" + title.id + "-x" + x,
          branch: "line-filler",
          xLevel: leftCorner + x,
          watchAfter: [
            lastParent === null || lastParent !== parent
              ? parent.id
              : elements[elements.length - 1].id,
          ],
        });
        lastParent = parent;
      }

      title.watchAfter = [
        ...title.watchAfter.filter((id) => id !== parent.id),
        elements[elements.length - 1].id,
      ];
    });
  });

  getElementsByXLevel().forEach((level, index) => {
    let levelHeight = getLevelHeight(level, true, index);
    if (index === 0) {
      level.forEach((title, index) => {
        title.yLevel = index - levelHeight / 2;
      });
      return;
    }

    const previousLevel = getElementsByXLevel()[index - 1];
    const previousHeight = getLevelHeight(previousLevel, true);
    const sortedLevel = level.length > 2 ? sortTitles(level) : level;

    sortedLevel.forEach((title, levelIndex) => {
      title.yLevel =
        levelIndex -
        levelHeight / 2 +
        (previousLevel.length - previousHeight) / 2;
    });
  });

  return elements;

  function filterElements(elements) {
    if (!filters) return;
    elements.forEach((element) => {
      let needCheck = true;
      while (needCheck) {
        const newWatchAfter = [];
        needCheck = false;
        element.watchAfter.forEach((parentId) => {
          const parentElement = elements.find((title) => title.id === parentId);
          if (!filters.includes(parentElement.branch)) {
            needCheck = true;
            newWatchAfter.push(
              ...parentElement.watchAfter.filter(
                (element) => !newWatchAfter.includes(element.id)
              )
            );
          } else {
            if (!newWatchAfter.includes(parentElement.id)) {
              newWatchAfter.push(parentElement.id);
            }
          }
        });

        element.watchAfter = newWatchAfter;
        if (element.watchAfter.length === 0 && element.standAlone) {
          element.standAlone = false;
        }
      }
    });
    const filtered = elements.filter(
      (element) => element.id === "mapRoot" || filters.includes(element.branch)
    );
    adjustParents(filtered);
    return filtered;
  }

  function adjustParents(elements) {
    elements.forEach((element) => {
      if (element.standAlone) return;
      const parents = element.watchAfter.map((elementId) =>
        elements.find((element) => element.id === elementId)
      );
      parents.forEach((parent) => {
        const grandparents = getAllParentElements(parent.id, elements);
        if (parent.standAlone) return;
        grandparents.forEach((grandparent) => {
          parents.forEach((parent) => {
            if (parent.id === grandparent.id) {
              element.watchAfter = element.watchAfter.filter(
                (id) => id !== parent.id
              );
            }
          });
        });
      });
    });
  }

  function getLevelHeight(level, countAll) {
    let height = 0;

    level.forEach((title) => {
      if (title.xLevel === 0) {
        height++;
        return;
      }
      if (countAll || !title.standAlone) height++;
    });
    return height;
  }

  function getElementsByXLevel() {
    let xLevels = [];
    elements.forEach((title) => {
      while (xLevels.length < title.xLevel + 1) {
        xLevels.push([]);
      }
      xLevels[title.xLevel].push(title);
    });
    return xLevels;
  }

  function getXLevel(id) {
    let level = 0;
    let step = elements.find((title) => title.id === id);

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
      step = elements.find(
        (title) => title.id === step.watchAfter[highestLevelIndex]
      );
    }
    return level;
  }

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
            title.branch === "line-filler" &&
            highestTitle.branch !== "line-filler"
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

    const midPoint = Math.floor(savedArray.length / 2);

    let firstHalf = savedArray.slice(0, midPoint);
    let secondHalf = savedArray.slice(midPoint);

    const firstHalfSorted = [];
    const secondHalfSorted = [];

    while (firstHalf.length !== 0) {
      let leastDeep = firstHalf[0];
      firstHalf.forEach((element) => {
        if (getDepth(element) < getDepth(leastDeep)) {
          leastDeep = element;
        }
      });
      firstHalfSorted.push(leastDeep);
      firstHalf = firstHalf.filter((element) => element.id !== leastDeep.id);
    }

    while (secondHalf.length !== 0) {
      let mostDeep = secondHalf[0];
      secondHalf.forEach((element) => {
        if (getDepth(element) > getDepth(mostDeep)) {
          mostDeep = element;
        }
      });
      secondHalfSorted.push(mostDeep);
      secondHalf = secondHalf.filter((element) => element.id !== mostDeep.id);
    }

    return [...firstHalfSorted, ...secondHalfSorted];

    function getParentsYLevel(title) {
      return title.watchAfter.reduce((acc, parentId) => {
        const parent = elements.find((title) => title.id === parentId);
        acc += parent.yLevel;
        return acc;
      }, 0);
    }

    function getDepth(element) {
      const xLevel = element.xLevel;
      let firstXLevelByParents = xLevel;

      const parents = getAllParentElements(element.id, elements);
      if (parents.length === 0) return 0;
      firstXLevelByParents = parents[0].xLevel;
      parents.forEach((element) => {
        if (element.xLevel < firstXLevelByParents) {
          firstXLevelByParents = element.xLevel;
        }
      });

      const depth = xLevel - firstXLevelByParents;
      return depth;
    }
  }
}
