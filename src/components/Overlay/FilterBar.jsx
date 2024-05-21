import { useContext, useEffect, useMemo, useState } from "react";
import Filter from "./Filter";
import { useSelector } from "react-redux";
import {
  makeSelectAllFilters,
  selectFilters,
} from "../../redux/slices/franchiseSlice";
import "../../styles/filters.css";

const FilterBar = () => {
  const selectAllFilters = useMemo(makeSelectAllFilters, []);
  const filters = useSelector(selectAllFilters);

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
