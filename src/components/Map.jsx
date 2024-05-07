import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Element from "./Element";
import MapHeading from "./MapHeading";
import { getMapElements } from "../data/mapBuilder";

const Map = ({ universe }) => {
  const initialScale = 1;
  const [scale, setScale] = useState(initialScale);
  const elementWidth = 200 * initialScale;
  const elementMarginRight = 200 * initialScale;
  const elementHeight = 50 * initialScale;
  const elementMarginBot = 60 * initialScale;
  const elementStyle = {
    width: elementWidth,
    height: elementHeight,
    marginRight: elementMarginRight,
    marginBot: elementMarginBot,
  };

  const [mapStyle, setMapStyle] = useState(null);

  const mapContainerRef = useRef(null);
  const mapWrapperRef = useRef(null);
  const mapRef = useRef(null);
  const headingRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startCoords, setStartCoords] = useState({});
  const [scrollCoords, setScrollCoords] = useState({ x: 1000, y: 0 });
  const [draggingOnElement, setDraggingOnElement] = useState(null);

  const [selected, setSelected] = useState(null);

  const branch = universe.branches[0];
  const titles = [
    { title: universe.title, id: -1, watchAfter: [] },
    ...branch.titles,
  ];
  const [elements, setElements] = useState([]);

  useEffect(() => {
    if (!titles) return;
    const mapElements = getMapElements(titles);
    setElements(mapElements);
  }, []);

  useEffect(() => {
    if (!elements || elements.length === 0) return;
    updateMapStyle();
  }, [elements]);

  useEffect(() => {
    window.addEventListener("resize", () => updateMapStyle());
    return () => {
      window.removeEventListener("resize", updateMapStyle);
    };
  }, [elements, scale]);

  function updateMapStyle(mapScale = scale) {
    let highestTitle;
    let lowestTitle;
    let rightTitle;

    if (elements.length === 0) return;
    elements.forEach((title) => {
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

    const mapContainerSize = mapContainerRef.current.getBoundingClientRect();
    const marginHorizontal =
      mapContainerSize.width / 2 + (mapWidth * (mapScale - 1)) / 2;
    const marginVertical =
      mapContainerSize.height / 2 + (mapHeight * (mapScale - 1)) / 2;

    const style = {
      width: mapWidth,
      minHeight: mapHeight,
      paddingTop: paddingTop,
      initialMargin: {
        x: mapContainerSize.width / 2,
        y: mapContainerSize.height / 2,
      },
      margin: {
        x: marginHorizontal,
        y: marginVertical,
      },
    };

    setMapStyle(style);
  }

  function handleMouseDown(e) {
    if (headingRef.current !== null) {
      const bounds = headingRef.current.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const isWithinBounds =
        mouseX >= bounds.left &&
        mouseX <= bounds.right &&
        mouseY >= bounds.top &&
        mouseY <= bounds.bottom;

      if (isWithinBounds) return;
    }
    setIsDragging(true);
    const startX = e.pageX - mapContainerRef.current.offsetLeft;
    const startY = e.pageY - mapContainerRef.current.offsetTop;
    setStartCoords({ x: startX, y: startY });
    setScrollCoords({
      left: mapContainerRef.current.scrollLeft,
      top: mapContainerRef.current.scrollTop,
    });
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - mapContainerRef.current.offsetLeft;
    const y = e.pageY - mapContainerRef.current.offsetTop;

    const walkX = x - startCoords.x;
    const walkY = y - startCoords.y;
    if (Math.abs(walkX) > 10 || Math.abs(walkY) > 10) {
      if (e.target.classList.contains("element")) {
        if (draggingOnElement !== e.target) {
          setDraggingOnElement(e.target);
        }
      }
      mapContainerRef.current.style.cursor = "move";
    }

    mapContainerRef.current.scrollLeft = scrollCoords.left - walkX;
    mapContainerRef.current.scrollTop = scrollCoords.top - walkY;
  }

  function handleMouseUp() {
    setIsDragging(false);
    mapContainerRef.current.style.cursor = "unset";
  }

  useLayoutEffect(() => {
    if (!mapContainerRef.current) return;
    mapContainerRef.current.addEventListener("wheel", handleScroll, {
      passive: false,
    });

    return () => {
      mapContainerRef.current &&
        mapContainerRef.current.removeEventListener("wheel", handleScroll);
    };
  });

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  function handleElementClick(selectedTitle) {
    if (selectedTitle.id === -1) return;
    if (selectedTitle.type === "line-filler") return;
    if (
      draggingOnElement &&
      draggingOnElement === document.getElementById(selectedTitle.id)
    ) {
      setDraggingOnElement(null);
      return;
    }
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

  const [oldZoom, setOldZoom] = useState(null);

  function handleScroll(e) {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);

    if ((scale < 0.4 && delta > 0) || (scale > 2 && delta < 0)) return;
    const newScale = scale + (delta > 0 ? -0.1 : 0.1);

    setOldZoom({
      scale: scale,
      scrollX: mapContainerRef.current.scrollLeft,
      scrollY: mapContainerRef.current.scrollTop,
    });
    setScale(newScale);
    updateMapStyle(newScale);
  }

  useLayoutEffect(() => {
    if (!mapStyle) return;
    updateScroll(oldZoom);

    function updateScroll(oldZoom, newScale = scale) {
      const oldScale = oldZoom.scale;
      const oldScroll = {
        x: oldZoom.scrollX,
        y: oldZoom.scrollY,
      };

      const initialWidth = mapStyle.width + mapStyle.initialMargin.x * 2;
      const initialHeight =
        mapStyle.minHeight + mapStyle.paddingTop + mapStyle.initialMargin.y * 2;

      const oldWidth = initialWidth * oldScale;
      const newWidth = initialWidth * newScale;

      const oldHeight = initialHeight * oldScale;
      const newHeight = initialHeight * newScale;

      const xRation = oldScroll.x / oldWidth;
      const yRation = oldScroll.y / oldHeight;

      const newScroll = {
        x: newWidth * xRation,
        y: newHeight * yRation,
      };

      mapContainerRef.current.scrollLeft = newScroll.x;
      mapContainerRef.current.scrollTop = newScroll.y;
    }
  }, [oldZoom]);

  return (
    <div className="map-frame">
      <div className="header">{universe.title}</div>
      <div className="map-wrapper" ref={mapWrapperRef}>
        <MapHeading
          title={selected}
          frameRef={mapContainerRef}
          ref={headingRef}
        />
        <div
          className="map-container"
          ref={mapContainerRef}
          onMouseDown={handleMouseDown}
        >
          <div
            className="map"
            ref={mapRef}
            style={{
              width: mapStyle && `${mapStyle.width}px`,
              minHeight: mapStyle && `${mapStyle.minHeight}px`,
              paddingTop: mapStyle && `${mapStyle.paddingTop}px`,
              margin:
                mapStyle && `${mapStyle.margin.y}px ${mapStyle.margin.x}px`,
              transform: `scale(${scale})`,
            }}
          >
            <div className="level">
              {elements &&
                elements.map((title) => (
                  <Element
                    key={title.id}
                    item={title}
                    style={elementStyle}
                    onClick={handleElementClick}
                    allElements={elements}
                  />
                ))}
              <svg className="trails"></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
