import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Element from "./Element";
import {
  MapFunctionality,
  getAllParentElements,
} from "../../utils/mapFunctionality";
import { UniverseContext } from "../../routes/FranchisePage";
import { useSelector, useDispatch } from "react-redux";
import { selectCompletedUniverse } from "../../redux/slices/userSlice";
import {
  selectActiveIds,
  selectLayout,
  selectSelectedId,
  selectUniverseId,
  setActiveIds,
  setLayout,
  setSelectedId,
} from "../../redux/slices/franchiseSlice";
import "../../styles/map.css";

export const ElementsContext = createContext();

const Map = () => {
  const { elements, pageRef, listRef, overviewRef } =
    useContext(UniverseContext);

  const dispatch = useDispatch();
  const universeId = useSelector(selectUniverseId);
  const completedTitles = useSelector((state) =>
    selectCompletedUniverse(state, universeId)
  );

  const selected = useSelector(selectSelectedId);
  const activeIds = useSelector(selectActiveIds);
  const layout = useSelector(selectLayout);

  const [mapStyle, setMapStyle] = useState(null);
  const [completedElements, setCompletedElements] = useState([]);
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
    height: 60,
    marginRight: 250,
    marginBot: 80,
  };

  const map = new MapFunctionality(
    mapContainerRef.current,
    getMapCenterOffsets(),
    elementStyle,
    scale,
    mapStyle,
    { all: elements, active: activeIds, completed: completedElements },
    pageRef.current,
    mapRef.current
  );

  useEffect(() => {
    if (!elements || elements.length === 0) return;
    setOldZoom({
      scale: scale,
      mapPadding: mapRef.current.style.paddingTop,
    });
    updateMapStyle();
    if (!selected) {
      dispatch(setSelectedId(elements[0].id));
    } else {
      if (!prevSelected.current) return;
      const prevElement = elements.find(
        (element) => element.id === prevSelected.current
      );
      if (!prevElement) {
        prevSelected.current = null;
        dispatch(setSelectedId(elements[0].id));
        return;
      }
      dispatch(setSelectedId(prevElement.id));
    }
  }, [elements]);

  useEffect(() => {
    const offset = getMapCenterOffsets();
    if (
      mapContainerRef.current.scrollLeft === 0 &&
      mapContainerRef.current.scrollTop === 0 &&
      (offset.x !== 0 || offset.y !== 0)
    ) {
      map.scrollToElement("mapRoot", false, offset);
    } else {
      if (selected && mapStyle && mapStyle.resized) {
        map.scrollToElement(selected, false, offset);
      }
    }
    prevMapStyle.current = mapStyle;
  }, [mapStyle]);

  //SELECTION
  useEffect(() => {
    const selectedElement = getElement(selected);
    if (!selectedElement) return;
    if (prevSelected.current !== selected) {
      map.scrollToElement(selected, true, getMapCenterOffsets());
    }
    let ids = !completedElements.includes(selected) ? [selected] : [];
    ids.push(
      ...getAllParentElements(
        selectedElement.id,
        elements,
        true,
        completedElements
      ).map((element) => element.id)
    );
    prevSelected.current = selected;
    dispatch(setActiveIds(ids));
  }, [elements, selected, completedElements]);

  useEffect(() => {
    if (!elements || !completedTitles) return;
    const completedElements = [];
    elements.forEach((element) => {
      if (completedTitles.includes(element.id)) {
        completedElements.push(element);
        completedElements.push(...map.getAllFillerParents(element));
      }
    });
    setCompletedElements(completedElements.map((element) => element.id));
  }, [completedTitles, elements]);

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
  }, [layout, scale]);

  useLayoutEffect(() => {
    map.updateScroll(oldZoom);
  }, [oldZoom]);

  function updateMapStyle(scale, elements, resized) {
    const newStyle = map.updateMapStyle(scale, elements, resized);
    setMapStyle(newStyle);
    dispatch(setLayout(newStyle.overlayLayout));
  }

  function handleElementClick(selectedTitle) {
    if (selectedTitle.branch === "line-filler") return;
    if (
      draggingOnElement &&
      draggingOnElement === document.getElementById(selectedTitle.id)
    ) {
      setDraggingOnElement(null);
      return;
    }
    if (selected && selected === selectedTitle.id) {
      map.scrollToElement(selected);
      return;
    }
    dispatch(setSelectedId(selectedTitle.id));
  }

  function getMapCenterOffsets() {
    if (!overviewRef.current || !listRef.current) return { x: 0, y: 0 };
    const overviewRect = overviewRef.current.getBoundingClientRect();
    const listRect = listRef.current.getBoundingClientRect();
    if (layout === "big")
      return { x: overviewRect.width + listRect.width, y: 0 };
    else if (layout === "small")
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
        pageRef.current.getBoundingClientRect().x,
      mapY:
        mapRef.current.getBoundingClientRect().y -
        pageRef.current.getBoundingClientRect().y,
    });
    // setScale(scale);
    // updateMapStyle(scale, elements);
    setScale(newScale);
    updateMapStyle(newScale, elements);
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
      {getElement(selected) && getElement(selected).backgroundUrl ? (
        <img
          src={getElement(selected).backgroundUrl}
          alt=""
          className="background"
        />
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
              <Element
                key={title.id}
                item={title}
                style={elementStyle}
                onClick={handleElementClick}
                completed={completedElements.includes(title.id)}
              />
            ))}
          <svg className="trails"></svg>
        </div>
      </div>
    </div>
  );
};

export default Map;
