import { useContext } from "react";
import Filter from "./Filter";
import "./filters.css";
import { UniverseContext } from "@/routes/FranchisePage/FranchisePage";

const FilterBar = ({ filters }) => {
  const { elements, selected } = useContext(UniverseContext);
  const selectedElement = elements.find(
    (element) => element.id === selected.id
  );
  return (
    <div className="filter-bar">
      <img
        className="glowing"
        src={selectedElement && selectedElement.smallImgUrl}
        alt=""
      />
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
