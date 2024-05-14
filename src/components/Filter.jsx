import { useContext, useEffect, useState } from "react";
import { UniverseContext } from "./FranchisePage";

const Filter = ({ name }) => {
  const { selectedFilters } = useContext(UniverseContext);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(
      selectedFilters.value && selectedFilters.value.includes(name)
        ? true
        : false
    );
  }, [selectedFilters.value]);

  function handleCheck() {
    setIsChecked(!isChecked);
    selectedFilters.set((prev) => {
      if (prev.includes(name)) return prev.filter((type) => type !== name);
      else return [...prev, name];
    });
  }

  return (
    <div className="filter">
      <label htmlFor={name}>{name}</label>
      <input
        onChange={handleCheck}
        type="checkbox"
        checked={isChecked && isChecked}
        className=""
        id={name}
      />
      <span className="custom-checkbox"></span>
    </div>
  );
};

export default Filter;
