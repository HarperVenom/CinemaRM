import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Element from "./Element";
import TitleOverview from "./TitleOverview";
import { getMapElements } from "../data/mapBuilder";
import { MapFunctionality } from "../data/mapFunctionality";
import FilterBar from "./FilterBar";
import List from "./List";
import { UniverseContext } from "./FranchisePage";

export const ElementsContext = createContext();

const Map = ({ universe }) => {
  const { selectedFilters } = useContext(UniverseContext);

  const [elements, setElements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeElements, setActiveElements] = useState([]);
  const [scale, setScale] = useState(1);
  const [mapStyle, setMapStyle] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingOnElement, setDraggingOnElement] = useState(null);
  const [oldZoom, setOldZoom] = useState(null);

  const prevSelected = useRef();
  const prevMapStyle = useRef();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapWrapperRef = useRef(null);
  const overviewRef = useRef(null);
  const listRef = useRef(null);

  const elementStyle = {
    width: 230,
    height: 60,
    marginRight: 250,
    marginBot: 80,
  };
  const titles = [
    { title: universe.title, id: -1, watchAfter: [] },
    ...universe.branches[0].titles,
  ];

  const map = new MapFunctionality(
    mapContainerRef.current,
    getMapCenterOffsets(),
    elementStyle,
    scale,
    mapStyle,
    elements,
    mapWrapperRef.current,
    mapRef.current
  );

  useEffect(() => {
    if (!titles || !selectedFilters.value || selectedFilters.value.length === 0)
      return;
    const mapElements = getMapElements(map, titles, selectedFilters.value);
    setElements(mapElements);
  }, [selectedFilters]);

  useEffect(() => {
    if (!elements || elements.length === 0) return;
    setOldZoom({
      scale: scale,
      mapPadding: mapRef.current.style.paddingTop,
    });
    setMapStyle(map.updateMapStyle());
    if (!selected) {
      setSelected(elements[0]);
    } else {
      if (!prevSelected.current) return;
      const prevElement = elements.find(
        (element) => element.id === prevSelected.current.id
      );
      if (!prevElement) {
        prevSelected.current = null;
        setSelected(elements[0]);
        return;
      }
      setSelected(prevElement);
    }
  }, [elements]);

  useEffect(() => {
    const offset = getMapCenterOffsets();
    if (
      mapContainerRef.current.scrollLeft === 0 &&
      mapContainerRef.current.scrollTop === 0 &&
      offset.x !== 0 &&
      offset.y !== 0
    ) {
      map.scrollToElement(-1, false, offset);
    } else {
      if (selected && mapStyle.resized) {
        map.scrollToElement(selected.id, false, offset);
      }
    }
    prevMapStyle.current = mapStyle;
  }, [mapStyle]);

  //SELECTION
  useEffect(() => {
    if (!selected) return;

    if (prevSelected.current && prevSelected.current.id !== selected.id) {
      map.scrollToElement(selected.id, true, getMapCenterOffsets());
    }

    let ids = [
      selected.id,
      ...map.getAllParentElements(selected).map((element) => element.id),
    ];

    const selectedElements = elements.map((element) => {
      if (ids.includes(element.id)) {
        element.active = true;
        return element;
      }
      element.active = false;
      return element;
    });
    prevSelected.current = selected;
    setActiveElements(selectedElements);
  }, [selected]);

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

  useEffect(() => {
    const setStyle = () => {
      setMapStyle(map.updateMapStyle(undefined, elements, true));
    };
    window.addEventListener("resize", setStyle);
    return () => {
      window.removeEventListener("resize", setStyle);
    };
  }, [mapStyle, scale]);

  useLayoutEffect(() => {
    if (!mapContainerRef.current) return;
    mapContainerRef.current.addEventListener("wheel", handleScroll, {
      passive: false,
    });

    return () => {
      mapContainerRef.current &&
        mapContainerRef.current.removeEventListener("wheel", handleScroll);
    };
  }, [mapStyle]);

  useLayoutEffect(() => {
    map.updateScroll(oldZoom);
  }, [oldZoom]);

  function handleElementClick(selectedTitle) {
    if (selectedTitle.type === "line-filler") return;
    if (
      draggingOnElement &&
      draggingOnElement === document.getElementById(selectedTitle.id)
    ) {
      setDraggingOnElement(null);
      return;
    }
    if (selected && selected.id === selectedTitle.id) {
      map.scrollToElement(selected.id);
      return;
    }
    setSelected(selectedTitle);
  }

  function getMapCenterOffsets() {
    if (!overviewRef.current || !listRef.current) return { x: 0, y: 0 };
    const overviewRect = overviewRef.current.getBoundingClientRect();
    const listRect = listRef.current.getBoundingClientRect();
    if (mapStyle.overlayLayout === "big")
      return { x: overviewRect.width + listRect.width, y: 0 };
    else if (mapStyle.overlayLayout === "small")
      return { x: listRect.width, y: -overviewRect.height };
    else return { x: 0, y: 0 };
  }

  function handleMouseDown(e) {
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

  function handleScroll(e) {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);

    if ((scale < 0.6 && delta > 0) || (scale > 2 && delta < 0)) return;
    const newScale = scale + (delta > 0 ? -0.1 : 0.1);

    setOldZoom({
      scale: scale,
      mapX:
        mapRef.current.getBoundingClientRect().x -
        mapWrapperRef.current.getBoundingClientRect().x,
      mapY:
        mapRef.current.getBoundingClientRect().y -
        mapWrapperRef.current.getBoundingClientRect().y,
    });
    setScale(newScale);
    setMapStyle(map.updateMapStyle(newScale));
  }

  function focusElement(id, smooth) {
    map.scrollToElement(id, smooth);
  }

  return (
    <ElementsContext.Provider value={{ elements, map }}>
      <div className="map-wrapper" ref={mapWrapperRef}>
        <div className={"overlay" + " " + (mapStyle && mapStyle.overlayLayout)}>
          <FilterBar elements={elements}></FilterBar>
          <List ref={listRef}></List>
          <TitleOverview
            className={mapStyle ? mapStyle.overlayLayout : ""}
            title={selected}
            frameRef={mapContainerRef}
            ref={overviewRef}
            focusElement={focusElement}
          />
        </div>
        <div
          className="map-container"
          ref={mapContainerRef}
          onMouseDown={handleMouseDown}
        >
          <div
            className="map"
            ref={mapRef}
            style={
              mapStyle
                ? {
                    width: `${mapStyle.width}px`,
                    minHeight: `${mapStyle.minHeight}px`,
                    paddingTop: `${mapStyle.paddingTop}px`,
                    margin: `${mapStyle.margin.top}px ${mapStyle.margin.right}px
                     ${mapStyle.margin.bot}px ${mapStyle.margin.left}px`,
                    transform: `scale(${scale})`,
                  }
                : null
            }
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
    </ElementsContext.Provider>
  );
};

export default Map;
