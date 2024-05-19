export function getMapElements(map, oldTitles, filters) {
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
          type: "line-filler",
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
    let levelHeight = getLevelHeight(level);
    if (index === 0) {
      level.forEach((title, index) => {
        title.yLevel = index - levelHeight / 2;
      });
      return;
    }
    const previousLevel = getElementsByXLevel()[index - 1];
    const previousHeight = getLevelHeight(previousLevel);

    const sortedLevel = sortTitles(level);
    sortedLevel.forEach((title, index) => {
      title.yLevel =
        index - levelHeight / 2 + (previousLevel.length - previousHeight) / 2;
    });
  });

  return elements;

  function filterElements(elements) {
    if (!filters) return;
    elements.forEach((element) => {
      let needCheck = true;
      // let standalone = true;

      while (needCheck) {
        const newWatchAfter = [];
        needCheck = false;
        element.watchAfter.forEach((parentId) => {
          const element = elements.find((title) => title.id === parentId);
          if (!filters.includes(element.type)) {
            needCheck = true;
            newWatchAfter.push(...element.watchAfter);
          } else {
            newWatchAfter.push(element.id);
          }
          // if (!element.standAlone) standalone = false;
        });
        element.watchAfter = newWatchAfter;
      }
      // element.standAlone = standalone;
    });
    const filtered = elements.filter(
      (element) => element.id === -1 || filters.includes(element.type)
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
        const grandparents = map.getAllParentElements(parent, elements);
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
            title.type === "line-filler" &&
            highestTitle.type !== "line-filler"
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
        const parent = elements.find((title) => title.id === parentId);
        acc += parent.yLevel;
        return acc;
      }, 0);
    }
  }
}
