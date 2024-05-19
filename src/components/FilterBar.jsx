import { useContext, useEffect, useState } from "react";
import Filter from "./Filter";
import { UniverseContext } from "./FranchisePage";

const FilterBar = () => {
  const { filters } = useContext(UniverseContext);

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
