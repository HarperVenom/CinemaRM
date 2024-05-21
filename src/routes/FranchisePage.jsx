import { createContext, useEffect, useMemo, useRef, useState } from "react";
import Map from "../components/Map/Map";
import { useDispatch, useSelector } from "react-redux";
import {
  makeSelectActiveFilters,
  selectFilters,
  selectLayout,
  selectSelectedId,
  setFilters,
  setUniverseId,
} from "../redux/slices/franchiseSlice";
import { getMapElements } from "../utils/mapBuilder";
import FilterBar from "../components/Overlay/FilterBar";
import List from "../components/Overlay/List";
import TitleOverview from "../components/Overlay/TitleOverview";
import "../styles/franchisePage.css";
import useFetch from "../utils/useFetch";

export const UniverseContext = createContext();

export async function loader({ params }) {
  return params.universeId;
}

const FranchisePage = () => {
  const [universes, loading, error] = useFetch("/api/universes");
  const universe = universes ? universes[0] : null;

  const [elements, setElements] = useState([]);

  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);

  const selectActiveFilters = useMemo(makeSelectActiveFilters, []);
  const activeFilters = useSelector(selectActiveFilters);

  const layout = useSelector(selectLayout);
  const selectedId = useSelector(selectSelectedId);

  const pageRef = useRef();
  const listRef = useRef();
  const overviewRef = useRef();

  useEffect(() => {
    if (!universe) return;
    dispatch(setUniverseId(universe.id));
    const filters = getAllFilters().reduce((acc, filter) => {
      acc[filter] = true;
      return acc;
    }, {});
    dispatch(setFilters(filters));
  }, [universe]);

  useEffect(() => {
    if (!universe) return;
    const titles = [
      {
        id: -1,
        title: universe.title,
        img_url: universe.img_url,
        description: universe.description,
        watchAfter: [],
      },
      ...universe.titles,
    ];

    if (!titles || !activeFilters || activeFilters.length === 0) return;
    const mapElements = getMapElements(titles, activeFilters);
    setElements(mapElements);
  }, [filters]);

  function getAllFilters() {
    const filters = [];
    const elements = universe.titles;
    if (!elements) return;
    elements.forEach((element) => {
      const type = element.type;
      if (!type || type === "line-filler") return;
      if (!filters.includes(type)) filters.push(type);
    });
    return filters;
  }

  return (
    <div className="page" ref={pageRef}>
      {!layout ? <div className="map-hide"></div> : null}
      {elements && elements.length > 0 ? (
        <UniverseContext.Provider
          value={{ universe, elements, pageRef, listRef, overviewRef }}
        >
          <div className={`overlay${layout != null ? " " + layout : ""}`}>
            <FilterBar></FilterBar>
            <List ref={listRef}></List>
            <TitleOverview
              className={layout ? layout : ""}
              title={elements.find((element) => element.id === selectedId)}
              ref={overviewRef}
            />
          </div>
          <Map></Map>
        </UniverseContext.Provider>
      ) : null}
    </div>
  );
};

export default FranchisePage;
