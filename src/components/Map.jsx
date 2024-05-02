import { useEffect, useRef, useState } from "react";
import Element from "./Element";
import MapHeading from "./MapHeading";

const Map = ({ universe }) => {
  const scale = 1;
  const elementWidth = 170 * scale;
  const elementMarginRight = 200 * scale;
  const elementHeight = 45 * scale;
  const elementMarginBot = 60 * scale;
  const [branchDimensions, setBranchDimensions] = useState(null);
  const [elementStyle, setElementStyle] = useState(null);

  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startCoords, setStartCoords] = useState({});
  const [scrollCoords, setScrollCoords] = useState({});

  const [selected, setSelected] = useState(null);

  const branch = universe.branches[0];
  const titles = [
    { title: universe.title, id: -1, watchAfter: [] },
    ...branch.titles,
  ];
  const [elements, setElements] = useState([]);

  useEffect(() => {
    if (!titles) return;

    titles.forEach((title, index) => {
      if (title.watchAfter.length === 0 && index !== 0)
        title.watchAfter = [titles[0].id];
    });

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

    let highestTitle;
    let lowestTitle;
    let rightTitle;
    titles.forEach((title) => {
      if (!highestTitle) {
        highestTitle = title;
      }
      if (!lowestTitle) {
        lowestTitle = title;
      }

      if (!rightTitle) {
        rightTitle = title;
      }

      if (title.yLevel < highestTitle.yLevel) highestTitle = title;
      else if (title.yLevel > lowestTitle.yLevel) {
        lowestTitle = title;
      }
      if (title.xLevel > rightTitle.xLevel) {
        rightTitle = title;
      }
    });

    const mapHeight =
      (lowestTitle.yLevel - highestTitle.yLevel) *
        (elementHeight + elementMarginBot) +
      elementHeight;
    const paddingTop =
      Math.abs(highestTitle.yLevel) * (elementHeight + elementMarginBot);
    const mapWidth =
      rightTitle.xLevel * (elementWidth + elementMarginRight) + elementWidth;
    setBranchDimensions({
      width: mapWidth,
      height: mapHeight,
      paddingTop: paddingTop,
    });

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
      step = titles.find(
        (title) => title.id === step.watchAfter[highestLevelIndex]
      );
    }
    return level;
  }

  useEffect(() => {
    if (!branchDimensions) return;
    const map = document.querySelector(".map");
    map.style.width = branchDimensions.width + "px";
    map.style.minHeight = branchDimensions.height + "px";
    map.style.paddingTop = branchDimensions.paddingTop + "px";
    setElementStyle({
      width: elementWidth,
      height: elementHeight,
      marginRight: elementMarginRight,
      marginBot: elementMarginBot,
      branchHeight: branchDimensions,
    });
  }, [branchDimensions]);

  function handleMouseDown(e) {
    setIsDragging(true);
    const startX = e.pageX - containerRef.current.offsetLeft;
    const startY = e.pageY - containerRef.current.offsetTop;
    setStartCoords({ x: startX, y: startY });
    setScrollCoords({
      left: containerRef.current.scrollLeft,
      top: containerRef.current.scrollTop,
    });
    containerRef.current.style.cursor = "move";
  }
  function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;

    const walkX = x - startCoords.x;
    const walkY = y - startCoords.y;

    containerRef.current.scrollLeft = scrollCoords.left - walkX;
    containerRef.current.scrollTop = scrollCoords.top - walkY;
  }

  function handleMouseUp() {
    // setTimeout(() => setIsDragging(false), 1);
    setIsDragging(false);
    containerRef.current.style.cursor = "unset";
  }

  function handleMouseLeave() {
    setIsDragging(false);
    containerRef.current.style.cursor = "unset";
  }

  function handleElementClick(selectedTitle) {
    if (selectedTitle.id === -1) return;
    if (selectedTitle.type === "line-filler") return;
    setSelected(selectedTitle);
  }

  useEffect(() => {
    if (!selected) return;

    let ids = [selected.id, ...getAllParentsIds(selected)];

    function getAllParentsIds(element) {
      let ids = [];
      if (element.watchAfter.length < 1 || element.standAlone) return ids;
      ids = [...ids, ...element.watchAfter];
      element.watchAfter.forEach((parentId) => {
        const parent = elements.find((element) => element.id === parentId);
        ids = [
          ...ids,
          ...getAllParentsIds(parent).filter((id) => !ids.includes(id)),
        ];
      });
      return ids;
    }

    const updatedElements = elements.map((element) => {
      if (ids.includes(element.id)) {
        element.active = true;
        return element;
      }
      element.active = false;
      return element;
    });

    setElements(updatedElements);
  }, [selected]);

  useEffect(() => {}, [elements]);

  return (
    <div className="map-frame">
      <div className="header">{universe.title}</div>
      <MapHeading title={selected} />
      <div
        className="map-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="map">
          <div className="level">
            {elements &&
              elements.map((title) => (
                <Element
                  key={title.id}
                  item={title}
                  style={elementStyle}
                  onClick={handleElementClick}
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
