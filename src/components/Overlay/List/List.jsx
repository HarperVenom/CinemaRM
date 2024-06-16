import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import { UniverseContext } from "@/routes/FranchisePage/FranchisePage";
import "./list.css";

const List = forwardRef(function (props, listContainerRef) {
  const { elements, isCompleted, selected } = useContext(UniverseContext);
  const [expanded, setExpanded] = useState(false);
  const [titles, setTitles] = useState([]);

  const listRef = useRef();

  useEffect(() => {
    setTitles(elements.filter((element) => element.branch != "line-filler"));
  }, [elements]);

  useEffect(() => {
    updateScroll();
  }, [listRef.current]);

  //To prevent scroll bar bug when it doesnt take space after page loading
  function updateScroll() {
    if (!listRef.current) return;
    const scrollHeight = listRef.current.scrollHeight;
    const height = listRef.current.getBoundingClientRect().height + 1;
    if (scrollHeight > height) {
      listRef.current.style.overflowY = "scroll";
      setTimeout(() => {
        listRef.current.style.overflowY = "auto";
      }, 1);
    }
  }

  useEffect(() => {
    if (selected.id === null) return;
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
      container.scrollTop = selectedElementOffsetTop - 20;
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
  }, [selected.id]);

  const selectedElement = elements.find(
    (element) => element.id === selected.id
  );

  return (
    <div
      className={`list-container${expanded ? " expanded" : ""}`}
      ref={listContainerRef}
    >
      <img
        className="glowing"
        src={selectedElement && selectedElement.smallImgUrl}
        alt=""
      />
      <div className="list" ref={listRef}>
        {titles.map((title, index) => (
          <button
            key={title.id}
            className={`list-element block${
              selected.id === title.id ? " selected" : ""
            }${isCompleted(title.id) ? " completed" : ""}`}
            data-id={title.id}
            onClick={() => selected.set(title.id)}
          >
            {title.imgUrl ? (
              <img
                className="list-image"
                src={title.smallImgUrl}
                alt=""
                loading="lazy"
              />
            ) : null}
            <h1 className="index">{index}</h1>
          </button>
        ))}
      </div>
    </div>
  );
});

export default List;
