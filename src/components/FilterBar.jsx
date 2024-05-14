import { useContext, useEffect, useState } from "react";
import Filter from "./Filter";
import { UniverseContext } from "./FranchisePage";

const FilterBar = ({ elements }) => {
  const { filters } = useContext(UniverseContext);
  // console.log(filters);
  // const [filters, setFilters] = useState([]);

  // useEffect(() => {
  //   if (!elements) return;
  //   elements.forEach((element) => {
  //     const type = element.type;
  //     if (!type || type === "line-filler") return;
  //     setFilters((prev) => (prev.includes(type) ? prev : [...prev, type]));
  //   });
  // }, [elements]);

  // useEffect(() => {
  //   // console.log(filters);
  // }, [filters]);

  return (
    <div className="filter-bar">
      {filters &&
        filters.map((filter, index) => (
          <Filter key={index} name={filter}></Filter>
        ))}
    </div>
  );
};

export default FilterBar;
