import { useContext, useEffect, useMemo, useState } from "react";
import { UniverseContext } from "../Pages/FranchisePage";
import {
  makeSelectActiveFilters,
  updateFilter,
} from "../../redux/slices/franchiseSlice";
import { useDispatch, useSelector } from "react-redux";

const Filter = ({ name }) => {
  const dispatch = useDispatch();
  const selectActiveFilters = useMemo(makeSelectActiveFilters, []);
  const activeFilters = useSelector(selectActiveFilters);

  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(activeFilters && activeFilters.includes(name) ? true : false);
  }, [activeFilters]);

  function handleCheck() {
    setIsChecked(!isChecked);
    dispatch(updateFilter({ filter: name, value: !isChecked }));
  }

  return (
    <div className="filter">
      <label htmlFor={name}>{name}</label>
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
