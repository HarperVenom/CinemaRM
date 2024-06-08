import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import MapElement from "@/components/Element/Element";
import {
  MapFunctionality,
  getAllParentElements,
} from "@/utils/mapFunctionality";
import { UniverseContext } from "@/routes/FranchisePage/FranchisePage";
import "./map.css";
import { GlobalContext } from "@/GlobalState";

const Map = () => {
  const { user, completed } = useContext(GlobalContext);
  const {
    universe,
    elements,
    pageRef,
    listRef,
    overviewRef,
    completedIds,
    layout,
    selected,
    pendingZoom,
  } = useContext(UniverseContext);

  const [mapStyle, setMapStyle] = useState(null);
  const [completedElements, setCompletedElements] = useState([]);
  const [activeElements, setActiveElements] = useState();
  const [scale, setScale] = useState(1);

  const [isDragging, setIsDragging] = useState(false);
  const [draggingOnElement, setDraggingOnElement] = useState(null);
  const [oldZoom, setOldZoom] = useState(null);

  const prevSelected = useRef();
  const prevMapStyle = useRef();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const elementStyle = {
    width: 230,
    height: 70,
    marginRight: 300,
    marginBot: 50,
  };

  const map = new MapFunctionality(
    mapContainerRef.current,
    getMapCenterOffsets(),
    elementStyle,
    scale,
    mapStyle,
    { all: elements },
    pageRef.current,
    mapRef.current
  );

  useEffect(() => {
    if (!elements || elements.length === 0 || !mapContainerRef.current) return;
    setOldZoom({
      scale: scale,
      mapPadding: mapRef.current.style.paddingTop,
    });
    updateMapStyle();
    if (!selected.id) {
      selected.set(elements[0].id);
    } else {
      if (!prevSelected.current) return;
      const prevElement = elements.find(
        (element) => element.id === prevSelected.current
      );
      if (!prevElement) {
        prevSelected.current = null;
        selected.set(elements[0].id);
        return;
      }
    }
  }, [elements, mapContainerRef.current]);

  useEffect(() => {
    const offset = getMapCenterOffsets();
    if (
      mapContainerRef.current.scrollLeft === 0 &&
      mapContainerRef.current.scrollTop === 0 &&
      (offset.x !== 0 || offset.y !== 0)
    ) {
      map.scrollToElement("mapRoot", false, offset);
    } else {
      if (selected.id && mapStyle && mapStyle.resized) {
        map.scrollToElement(selected.id, false, offset);
      }
    }
    prevMapStyle.current = mapStyle;
  }, [mapStyle]);

  useEffect(() => {
    if (!completedIds) return;
    let currentTitle = elements[1];

    let i = 1;
    while (
      completedIds.includes(currentTitle.id) ||
      currentTitle.branch === "line-filler"
    ) {
      i++;
      if (i >= elements.length) return;
      currentTitle = elements[i];
    }
    selected.set(currentTitle.id);
  }, [completedIds, completed]);

  //SELECTION
  useEffect(() => {
    const selectedElement = getElement(selected.id);
    if (!selectedElement) return;
    if (prevSelected.current !== selected.id) {
      map.scrollToElement(selected.id, true, getMapCenterOffsets());
    }
    let ids = !completedElements.includes(selected.id) ? [selected.id] : [];
    ids.push(
      ...getAllParentElements(
        selectedElement.id,
        elements,
        true,
        completedElements
      ).map((element) => element.id)
    );
    setActiveElements(ids);
    prevSelected.current = selected.id;
  }, [elements, selected.id, completedElements]);

  useEffect(() => {
    if (!elements || !completedIds) {
      setCompletedElements([]);
      return;
    }
    const completedElements = [elements[0]];
    elements.forEach((element) => {
      if (completedIds.includes(element.id)) {
        completedElements.push(element);
        completedElements.push(...map.getAllFillerParents(element));
      }
    });
    setCompletedElements(completedElements.map((element) => element.id));
  }, [completedIds, elements]);

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
      updateMapStyle(scale, elements, true);
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
  }, [layout.value, scale]);

  useLayoutEffect(() => {
    map.updateScroll(oldZoom);
  }, [oldZoom]);

  function updateMapStyle(scale, elements, resized) {
    const newStyle = map.updateMapStyle(
      scale,
      elements,
      resized,
      mapContainerRef.current
    );
    setMapStyle(newStyle);
    layout.set(newStyle.overlayLayout);
  }

  useEffect(() => {
    if (!pendingZoom) return;
    zoom(pendingZoom.zoomIn);
  }, [pendingZoom]);

  function handleElementClick(selectedTitle) {
    if (selectedTitle.branch === "line-filler") return;
    if (
      draggingOnElement &&
      draggingOnElement === document.getElementById(selectedTitle.id)
    ) {
      setDraggingOnElement(null);
      return;
    }
    if (selected.id && selected.id === selectedTitle.id) {
      map.scrollToElement(selected.id);
      return;
    }
    selected.set(selectedTitle.id);
  }

  function getMapCenterOffsets() {
    if (!overviewRef.current || !listRef.current) return { x: 0, y: 0 };
    const overviewRect = overviewRef.current.getBoundingClientRect();
    const listRect = listRef.current.getBoundingClientRect();
    if (layout.value === "big")
      return { x: overviewRect.width + listRect.width, y: 0 };
    else if (layout.value === "small")
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

  function zoom(zoomIn) {
    if ((scale < 0.4 && !zoomIn) || (scale > 2 && zoomIn)) return;
    const newScale = scale + (!zoomIn ? -0.1 : 0.1);

    setOldZoom({
      scale: scale,
      mapX:
        mapRef.current.getBoundingClientRect().x -
        pageRef.current.getBoundingClientRect().x,
      mapY:
        mapRef.current.getBoundingClientRect().y -
        pageRef.current.getBoundingClientRect().y,
    });
    setScale(newScale);
    updateMapStyle(newScale, elements);
  }

  function handleScroll(e) {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    zoom(delta < 0);
  }

  function getElement(id) {
    return elements.find((element) => element.id === id);
  }

  return (
    <div
      className="map-container"
      ref={mapContainerRef}
      onMouseDown={handleMouseDown}
    >
      {universe && universe.backgroundUrl ? (
        <img src={universe.backgroundUrl} alt="" className="background" />
      ) : null}
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
              <MapElement
                key={title.id}
                item={title}
                style={elementStyle}
                onClick={handleElementClick}
                isActive={activeElements && activeElements.includes(title.id)}
                isCompleted={
                  completedElements && completedElements.includes(title.id)
                }
              />
            ))}
          <svg className="trails"></svg>
        </div>
      </div>
    </div>
  );
};

export default Map;
