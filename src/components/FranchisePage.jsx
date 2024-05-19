import { createContext, useEffect, useState } from "react";
import Map from "./Map";

export const UniverseContext = createContext();

const Page = ({ universe, loading, error }) => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    setFilters(getAllFilters());
  }, [universe]);

  useEffect(() => {
    if (filters.length === 0) return;
    setSelectedFilters([filters[0]]);
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
    <UniverseContext.Provider
      value={{
        filters: filters,
        selectedFilters: { value: selectedFilters, set: setSelectedFilters },
      }}
    >
      <div className="page">
        <h1>{universe.title}</h1>
        {universe && <Map universe={universe}></Map>}
      </div>
    </UniverseContext.Provider>
  );
};

export default Page;
