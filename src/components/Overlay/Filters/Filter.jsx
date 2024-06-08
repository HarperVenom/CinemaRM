import { useContext, useEffect, useState } from "react";
import { UniverseContext } from "@/routes/FranchisePage/FranchisePage";

const Filter = ({ name }) => {
  const { elements, selected, activeFilters, setActiveFilters } =
    useContext(UniverseContext);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(activeFilters && activeFilters.includes(name) ? true : false);
  }, [activeFilters]);

  function handleCheck() {
    setIsChecked(!isChecked);
    setActiveFilters((prev) =>
      !isChecked ? [...prev, name] : prev.filter((filter) => filter !== name)
    );
  }

  const selectedElement = elements.find(
    (element) => element.id === selected.id
  );

  return (
    <div
      className="filter interactive-element"
      style={{ opacity: isChecked ? null : "0.6" }}
    >
      <label htmlFor={name}>
        {name}
        {/* <img
          className="glowing"
          src={selectedElement && selectedElement.smallImgUrl}
          alt=""
        /> */}
      </label>
      <input
        onChange={handleCheck}
        type="checkbox"
        checked={isChecked}
        className=""
        id={name}
      />
      <span className="custom-checkbox"></span>
    </div>
  );
};

export default Filter;
