import { createContext, useContext, useEffect, useRef, useState } from "react";
import Map from "@/components/Map/Map";
import { getMapElements } from "@/utils/mapBuilder";
import FilterBar from "@/components/Overlay/Filters/FilterBar";
import List from "@/components/Overlay/List/List";
import TitleOverview from "@/components/Overlay/TitleOverview/TitleOverview";
import "./franchisePage.css";
import useApi from "@/utils/useApi";
import { useLoaderData } from "react-router-dom";
import { GlobalContext } from "@/GlobalState";
import MenuButton from "@/assets/menuButton.svg";
import NavBar from "@/components/common/NavBar/NavBar";
import { Helmet } from "react-helmet";
import Plus from "@/assets/plus.svg";
import Minus from "@/assets/minus.svg";

const apiURL = process.env.API_URL;

export const UniverseContext = createContext();

export async function loader({ params }) {
  return params.universeId;
}

const FranchisePage = () => {
  const universeId = useLoaderData();
  const { data: universe } = useApi(`${apiURL}/api/universes/${universeId}`);

  const { user, userLoading, completed, updateUser, loading } =
    useContext(GlobalContext);
  const completedUniverse = completed.find(
    (universe) => universe.universeId === universeId
  );

  const completedIds = completedUniverse?.titles;
  const [elements, setElements] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [layout, setLayout] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [menuOpened, setMenuOpened] = useState(false);
  const [pendingZoom, setPendingZoom] = useState(null);

  const pageRef = useRef();
  const listRef = useRef();
  const overviewRef = useRef();

  useEffect(() => {
    if (!completedChanged()) return;

    if (
      completedUniverse &&
      completedUniverse.filters &&
      completedUniverse.filters.length > 0
    ) {
      setActiveFilters(completedUniverse.filters);
    } else {
      if (activeFilters.length === 0) setActiveFilters(getAllFilters());
    }
  }, [completed, universe]);

  useEffect(() => {
    if (!user || !completedUniverse || !completedUniverse.filters) return;
    if (
      completedUniverse.filters.length === 0 ||
      completedUniverse.filters.length === activeFilters.length
    )
      setFiltersApplied(true);
  }, [completed]);

  useEffect(() => {
    updateElements();
  }, [activeFilters, universe]);

  useEffect(() => {
    if (!completedUniverse || !completedUniverse.filters) {
      return;
    }
    updateFilters();
  }, [activeFilters]);

  useEffect(() => {
    if (user) return;
    updateElements();
  }, [completed]);

  function updateFilters(newFilters = activeFilters) {
    const newCompleted = [
      ...completed.filter((universe) => universe.universeId !== universeId),
      {
        ...completedUniverse,
        filters: newFilters,
      },
    ];
    updateUser({
      completed: newCompleted,
    });
  }

  function completedChanged() {
    return !(
      (!completed ||
        (completedUniverse &&
          activeFilters.length !== 0 &&
          completedUniverse.filters &&
          completedUniverse.filters.length === activeFilters.length)) &&
      activeFilters.length > 0
    );
  }

  function updateElements() {
    if (!universe) return;
    const titles = [
      {
        id: "mapRoot",
        watchAfter: [],
        title: universe.title,
        imgUrl: universe.imgUrl,
        smallImgUrl: universe.imgUrl,
        description: universe.description,
      },
      ...universe.titles,
    ];
    if (!titles || !activeFilters || activeFilters.length === 0) return;
    const mapElements = getMapElements(titles, activeFilters);
    setElements(mapElements);
    if (user) setFiltersApplied(true);
  }

  function getAllFilters() {
    if (!universe) return [];
    const filters = [];
    const elements = universe.titles;
    if (!elements) return;
    elements.forEach((element) => {
      const type = element.branch;
      if (!type || type === "line-filler") return;
      if (!filters.includes(type)) filters.push(type);
    });
    return filters;
  }

  const isCompleted = (titleId) => {
    if (completed) {
      const completedUniverse = completed.find(
        (completedUniverse) => completedUniverse.universeId === universeId
      );
      if (completedUniverse) {
        if (titleId === "mapRoot" || completedUniverse.titles.includes(titleId))
          return true;
      }
    }
    return false;
  };

  function filterByRelease() {
    if (!elements) return;
    let unfilteredArray = elements.map((element) => ({ ...element }));
    const filteredArray = [];
    while (unfilteredArray.length !== 0) {
      let first = unfilteredArray[0];
      unfilteredArray.forEach((element) => {
        if (element.releaseDate < first.releaseDate) first = element;
      });
      filteredArray.push(first);
      unfilteredArray = unfilteredArray.filter(
        (element) => element.id !== first.id
      );
    }
    return filteredArray;
  }

  const selectedElement = elements.find((element) => element.id === selectedId);

  let draw = false;
  if (!userLoading) {
    if (user) {
      if (!completedUniverse || filtersApplied) {
        draw = true;
      }
    } else {
      draw = true;
    }
  }

  return (
    <div className="franchise-page" ref={pageRef}>
      <Helmet>
        <title>{universe && universe.title}</title>
      </Helmet>
      {!universe ? <div className="map-hide"></div> : null}
      {loading ? <div className="loading-screen"></div> : null}
      {draw ? (
        elements && elements.length > 0 ? (
          <UniverseContext.Provider
            value={{
              universe,
              elements: filterByRelease(elements),
              pageRef,
              listRef,
              overviewRef,
              isCompleted,
              completedIds,
              activeFilters,
              setActiveFilters,
              updateFilters,
              filtersApplied,
              layout: { value: layout, set: setLayout },
              selected: { id: selectedId, set: setSelectedId },
              pendingZoom,
            }}
          >
            <div className={`menu${menuOpened ? " opened" : ""}`}>
              <NavBar
                forceClose={menuOpened ? false : true}
                position={"relative"}
              ></NavBar>
              <div className="current-universe">
                <p>Currently viewing:</p>
                <p className="title">{universe.title}</p>
              </div>
              <div className="cover" onClick={() => setMenuOpened(false)}></div>
            </div>

            <div className={`overlay${layout != null ? " " + layout : ""}`}>
              <FilterBar filters={getAllFilters()}></FilterBar>
              <List ref={listRef}></List>
              <TitleOverview
                title={elements.find((element) => element.id === selectedId)}
                ref={overviewRef}
              />
              <button
                className="menu-button"
                onClick={() => setMenuOpened(true)}
              >
                <img
                  className="glowing"
                  src={selectedElement && selectedElement.smallImgUrl}
                  alt=""
                />
                <div className="hover"></div>
                <img className="svg" src={MenuButton} alt="" />
              </button>
              <div className="zoom">
                <button
                  className="zoom-in-button"
                  onClick={() => setPendingZoom({ zoomIn: true })}
                >
                  <img src={Plus} alt="" />
                </button>
                <button
                  className="zoom-out-button"
                  onClick={() => setPendingZoom({ zoomIn: false })}
                >
                  <img src={Minus} alt="" />
                </button>
              </div>
            </div>
            <Map></Map>
          </UniverseContext.Provider>
        ) : null
      ) : null}
    </div>
  );
};

export default FranchisePage;
