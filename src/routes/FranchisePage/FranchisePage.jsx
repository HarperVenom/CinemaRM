import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Map from "@/components/Map/Map";
import { getMapElements } from "@/utils/mapBuilder";
import FilterBar from "@/components/Overlay/Filters/FilterBar";
import List from "@/components/Overlay/List/List";
import TitleOverview from "@/components/Overlay/TitleOverview/TitleOverview";
import "./franchisePage.css";
import useApi from "@/utils/useApi";
import { useLoaderData } from "react-router-dom";
import { backendUrl } from "@/config";
import { GlobalContext } from "@/GlobalState";
import MenuButton from "@/assets/menuButton.svg";
import NavBar from "@/components/common/NavBar/NavBar";

export const UniverseContext = createContext();

export async function loader({ params }) {
  return params.universeId;
}

const FranchisePage = () => {
  const universeId = useLoaderData();
  const { data: universe } = useApi(
    `${backendUrl}/api/universes/${universeId}`
  );

  const { user, completed, updateUser, loading } = useContext(GlobalContext);
  const completedUniverse = completed.find(
    (universe) => universe.universeId === universeId
  );

  const completedIds = completedUniverse?.titles;
  const [elements, setElements] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [layout, setLayout] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [menuOpened, setMenuOpened] = useState(false);

  const pageRef = useRef();
  const listRef = useRef();
  const overviewRef = useRef();

  useEffect(() => {
    if (
      (!completed ||
        (completedUniverse &&
          activeFilters.length !== 0 &&
          completedUniverse.filters &&
          completedUniverse.filters.length === activeFilters.length)) &&
      activeFilters.length > 0
    )
      return;

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
    updateElements();
    if (!completedUniverse) return;
    updateUser({
      completed: [
        ...completed.filter((universe) => universe.universeId !== universeId),
        {
          ...completedUniverse,
          filters: activeFilters,
        },
      ],
    });
  }, [activeFilters, universe]);

  useEffect(() => {
    if (user) return;
    updateElements();
  }, [completed]);

  function updateElements() {
    if (!universe) return;
    const titles = [
      {
        id: "mapRoot",
        watchAfter: [],
        title: universe.title,
        imgUrl: universe.imgUrl,
        description: universe.description,
      },
      ...universe.titles,
    ];
    if (!titles || !activeFilters || activeFilters.length === 0) return;
    const mapElements = getMapElements(titles, activeFilters);
    setElements(mapElements);
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
  return (
    <div className="franchise-page" ref={pageRef}>
      {!universe ? <div className="map-hide"></div> : null}
      {loading ? <div className="loading-screen"></div> : null}
      {elements && elements.length > 0 ? (
        <UniverseContext.Provider
          value={{
            universe,
            elements,
            pageRef,
            listRef,
            overviewRef,
            isCompleted,
            completedIds,
            activeFilters,
            setActiveFilters,
            layout: { value: layout, set: setLayout },
            selected: { id: selectedId, set: setSelectedId },
          }}
        >
          <div className={`menu${menuOpened ? " opened" : ""}`}>
            <NavBar forceClose={menuOpened ? false : true}></NavBar>
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
            <button className="menu-button" onClick={() => setMenuOpened(true)}>
              <img className="interactive-element" src={MenuButton} alt="" />
            </button>
          </div>
          <Map></Map>
        </UniverseContext.Provider>
      ) : null}
    </div>
  );
};

export default FranchisePage;
