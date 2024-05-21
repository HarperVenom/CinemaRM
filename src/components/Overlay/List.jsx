import {
  forwardRef,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { ElementsContext } from "../Map/Map";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedId,
  selectUniverseId,
  setSelectedId,
} from "../../redux/slices/franchiseSlice";
import { UniverseContext } from "../../routes/FranchisePage";
import { selectCompletedUniverse } from "../../redux/slices/userSlice";
import "../../styles/list.css";

const List = forwardRef(function (props, listContainerRef) {
  const dispatch = useDispatch();
  const { elements } = useContext(UniverseContext);
  const selected = useSelector(selectSelectedId);
  const universeId = useSelector(selectUniverseId);
  const completedTitles = useSelector((state) =>
    selectCompletedUniverse(state, universeId)
  );

  const [expanded, setExpanded] = useState(false);

  const [titles, setTitles] = useState([]);

  const listRef = useRef();

  useEffect(() => {
    setTitles(elements.filter((element) => element.type != "line-filler"));
  }, [elements]);

  useEffect(() => {
    if (selected === null) return;
    const selectedTitle = document.querySelector(
      `.list-element[data-id="${selected}"]`
    );
    if (!selectedTitle) return;
    const container = listRef.current;
    const selectedElementOffsetTop = selectedTitle.offsetTop;
    const containerScrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    // Check if the selected element is above the visible area
    if (selectedElementOffsetTop < containerScrollTop) {
      container.scrollTop = selectedElementOffsetTop - 5;
    }
    // Check if the selected element is below the visible area
    else if (
      selectedElementOffsetTop + selectedTitle.clientHeight >
      containerScrollTop + containerHeight
    ) {
      container.scrollTop =
        selectedElementOffsetTop +
        selectedTitle.clientHeight +
        5 -
        containerHeight;
    }
  }, [selected]);
  return (
    <div
      className={`list-container${expanded ? " expanded" : ""}`}
      ref={listContainerRef}
    >
      <div className="list" ref={listRef}>
        {titles.map((title, index) => (
          <div
            key={title.id}
            className={`list-element block${
              selected === title.id ? " selected" : ""
            }${
              completedTitles && completedTitles.includes(title.id)
                ? " completed"
                : ""
            }`}
            data-id={title.id}
            onClick={() => dispatch(setSelectedId(title.id))}
          >
            {title.img_url ? (
              <img className="list-image" src={title.img_url} alt="" />
            ) : null}
            <h1 className="index">{index}</h1>
          </div>
        ))}
      </div>
    </div>
  );
});

export default List;
