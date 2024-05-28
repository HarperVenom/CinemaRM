import Filter from "./Filter";
import "./filters.css";

const FilterBar = ({ filters }) => {
  return (
    <div className="filter-bar">
      <div className="filters">
        {filters &&
          filters.map((filter, index) => (
            <Filter key={index} name={filter}></Filter>
          ))}
      </div>
    </div>
  );
};

export default FilterBar;
