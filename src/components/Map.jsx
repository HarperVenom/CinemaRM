import {
  createContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Element from "./Element";
import MapHeading from "./MapHeading";
import { getMapElements } from "../data/mapBuilder";

export const ElementsContext = createContext();

const Map = ({ universe }) => {
  const initialScale = 1;
  const [scale, setScale] = useState(initialScale);
  const elementWidth = 230 * initialScale;
  const elementMarginRight = 230 * initialScale;
  const elementHeight = 60 * initialScale;
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
    if (
      mapContainerRef.current.scrollLeft === 0 &&
      mapContainerRef.current.scrollTop === 0
    )
      scrollToElement(-1, false);
  }, [mapStyle]);

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
    mapContainerRef.current.dataset.startX =
      e.pageX - mapContainerRef.current.offsetLeft;
    mapContainerRef.current.dataset.startY =
      e.pageY - mapContainerRef.current.offsetTop;

    mapContainerRef.current.dataset.scrollLeft =
      mapContainerRef.current.scrollLeft;
    mapContainerRef.current.dataset.scrollTop =
      mapContainerRef.current.scrollTop;
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - mapContainerRef.current.offsetLeft;
    const y = e.pageY - mapContainerRef.current.offsetTop;

    const walkX = x - mapContainerRef.current.dataset.startX;
    const walkY = y - mapContainerRef.current.dataset.startY;

    if (Math.abs(walkX) > 10 || Math.abs(walkY) > 10) {
      if (e.target.classList.contains("element")) {
        if (draggingOnElement !== e.target) {
          setDraggingOnElement(e.target);
        }
      }
      mapContainerRef.current.style.cursor = "move";
    }
    mapContainerRef.current.scrollLeft =
      mapContainerRef.current.dataset.scrollLeft - walkX;
    mapContainerRef.current.scrollTop =
      mapContainerRef.current.dataset.scrollTop - walkY;
  }

  function handleMouseUp() {
    setIsDragging(false);
    mapContainerRef.current.style.cursor = "unset";
  }

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
    if (selectedTitle.type === "line-filler") return;
    if (
      draggingOnElement &&
      draggingOnElement === document.getElementById(selectedTitle.id)
    ) {
      setDraggingOnElement(null);
      return;
    }
    scrollToElement(selectedTitle.id);
    if (selectedTitle.id === -1) return;
    setSelected(selectedTitle);
  }

  const [oldZoom, setOldZoom] = useState(null);

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

  function handleScroll(e) {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);

    if ((scale < 0.6 && delta > 0) || (scale > 2 && delta < 0)) return;
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

      const headingWidth =
        headingRef.current && headingRef.current.getBoundingClientRect().width;

      const oldScroll = {
        x: oldZoom.scrollX + headingWidth / 2,
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
        x: newWidth * xRation - headingWidth / 2,
        y: newHeight * yRation,
      };

      mapContainerRef.current.scrollLeft = newScroll.x;
      mapContainerRef.current.scrollTop = newScroll.y;
    }
  }, [oldZoom]);

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

  function scrollToElement(id, smooth = true) {
    const element = document.getElementById(id);
    if (!element) return;
    const x = element.getBoundingClientRect().x;
    const y = element.getBoundingClientRect().y;

    const currentScrollLeft = mapContainerRef.current.scrollLeft;
    const currentScrollTop = mapContainerRef.current.scrollTop;

    const windowWidth = mapContainerRef.current.getBoundingClientRect().width;
    const windowHeight = mapContainerRef.current.getBoundingClientRect().height;

    const headingWidth =
      headingRef.current && headingRef.current.getBoundingClientRect().width;

    const newScrollLeft =
      currentScrollLeft +
      x -
      mapWrapperRef.current.offsetLeft -
      windowWidth / 2 +
      (elementStyle.width * scale) / 2 -
      headingWidth / 2;
    const newScrollTop =
      currentScrollTop +
      y -
      mapWrapperRef.current.offsetTop -
      windowHeight / 2 +
      (elementStyle.height * scale) / 2;

    if (smooth)
      smoothScrollTo(mapContainerRef.current, newScrollLeft, newScrollTop, 500);
    else {
      mapContainerRef.current.scrollLeft = newScrollLeft;
      mapContainerRef.current.scrollTop = newScrollTop;
    }
  }

  function smoothScrollTo(container, targetX, targetY, duration) {
    const startX = container.scrollLeft;
    const startY = container.scrollTop;
    const distanceX = targetX - startX;
    const distanceY = targetY - startY;
    const startTime = performance.now();

    function step() {
      const currentTime = performance.now();
      const elapsedTime = currentTime - startTime;
      const scrollProgress = Math.min(elapsedTime / duration, 1);
      const scrollPositionX =
        startX + distanceX * easeInOutQuad(scrollProgress);
      const scrollPositionY =
        startY + distanceY * easeInOutQuad(scrollProgress);

      container.scrollLeft = scrollPositionX;
      container.scrollTop = scrollPositionY;

      if (scrollProgress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  return (
    <ElementsContext.Provider value={elements}>
      <div className="map-frame">
        <div className="header">{universe.title}</div>
        <div className="map-wrapper" ref={mapWrapperRef}>
          <MapHeading
            title={selected}
            frameRef={mapContainerRef}
            ref={headingRef}
            focusElement={scrollToElement}
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
                    />
                  ))}
                <svg className="trails"></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ElementsContext.Provider>
  );
};

export default Map;
