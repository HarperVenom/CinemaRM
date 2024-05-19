import {
  forwardRef,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { ElementsContext } from "./Map";
import Arrow from "../assets/arrow.svg";

const List = forwardRef(function (props, listContainerRef) {
  const { onClick } = props;
  const { elements, selected } = useContext(ElementsContext);
  const [expanded, setExpanded] = useState(false);

  const [titles, setTitles] = useState([]);

  const listRef = useRef();

  useEffect(() => {
    setTitles(elements.filter((element) => element.type != "line-filler"));
  }, [elements]);

  useEffect(() => {
    if (!selected) return;
    const selectedTitle = document.querySelector(
      `.list-element[data-id="${selected.id}"]`
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
              selected && selected.id === title.id ? " selected" : ""
            }`}
            data-id={title.id}
            onClick={() => onClick(title)}
          >
            {title.img_url ? <img src={title.img_url} alt="" /> : null}
            <h1 className="index">{index}</h1>
          </div>
        ))}
      </div>
    </div>
  );
});

export default List;
