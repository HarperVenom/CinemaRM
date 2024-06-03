import {
  forwardRef,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import CheckMark from "@/assets/checkMark.svg";
import { UniverseContext } from "@/routes/FranchisePage/FranchisePage";
import { getAllParentElements } from "@/utils/mapFunctionality";
import "./overview.css";
import { GlobalContext } from "@/GlobalState";

const TitleOverview = forwardRef(function (props, overviewRef) {
  const { completed, setCompleted } = useContext(GlobalContext);
  const { universe, isCompleted, layout, activeFilters, setActiveFilters } =
    useContext(UniverseContext);
  const { title } = props;
  const [watchAfter, setWatchAfter] = useState([]);

  const infoRef = useRef(null);

  useEffect(() => {
    if (!title) return;

    if (infoRef.current) {
      infoRef.current.scrollTop = 0;
    }

    // setWatchAfter(
    //   getAllParentElements(title.id, elements).filter(
    //     (element) => element.branch !== "line-filler" && element.id !== -1
    //   )
    // );
  }, [title]);

  function getYear() {
    if (!title || !title.releaseDate) return "";
    const releaseDate = new Date(title.releaseDate);
    return releaseDate.getFullYear();
  }

  function getDuration() {
    if (!title || !title.duration) return "";
    const totalMinutes = title.duration;
    const hours = parseInt(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours > 0 ? hours + "h " : ""}${minutes}m`;
  }

  function getFontSize() {
    if (!title || !title.title) return;
    const length = title.title.length;
    const newSize = 5 - parseInt(length / 8) / 2;
    return (
      (layout.value === "small" ? Math.max(0.6 * newSize, 2) : newSize) + "vh"
    );
  }

  function handleCompleteButton() {
    const newCompleted = completed.map((universe) => ({ ...universe }));
    const universeId = universe.id;
    const currentUniverse = completed.find(
      (universe) => universe.universeId === universeId
    );

    if (title.id === "mapRoot") {
      if (currentUniverse) {
        setCompleted(
          newCompleted.filter(
            (universe) => universe.universeId !== currentUniverse.universeId
          )
        );
        return;
      } else newCompleted.push({ universeId: universe.id, titles: [] });
    } else if (currentUniverse) {
      const currentTitle = currentUniverse.titles.find(
        (completedTitle) => title.id === completedTitle
      );
      if (currentTitle) {
        setCompleted([
          ...newCompleted.filter(
            (universe) => universe.universeId !== currentUniverse.universeId
          ),
          {
            ...currentUniverse,
            titles: currentUniverse.titles.filter(
              (title) => title !== currentTitle
            ),
          },
        ]);
        return;
      }
      currentUniverse.titles.push(title.id);
    } else {
      newCompleted.push({ universeId: universe.id, titles: [title.id] });
    }
    // console.log(activeFilters);
    // setActiveFilters(activeFilters);
    setCompleted(newCompleted);
  }

  return title ? (
    <div className={`overview${" " + layout.value}`} ref={overviewRef}>
      {title && title.imgUrl && (
        <img className="poster" src={title.imgUrl} alt="" />
      )}
      <div className="info-action">
        <div className="info" ref={infoRef}>
          <div className="title" style={{ fontSize: getFontSize() }}>
            {title.title}
          </div>
          <div className="specifics">{`${getYear()} · ${getDuration()}`}</div>
          <div className="description">{title.description}</div>
        </div>
        <div className="action-bar">
          {/* <div className="watch-after">
          {watchAfter.length > 0 && !title.standAlone && <h5>WATCH FIRST: </h5>}
          <div className="watch-after-list">
            {!title.standAlone &&
              watchAfter.map((element) => {
                return (
                  <div
                    key={element.id}
                    className={`watch-after-title${
                      directParents.includes(element) ? " important" : ""
                    }`}
                    onClick={() => focusElement(element.id, true)}
                  >
                    {element.title}
                  </div>
                );
              })}
          </div>
        </div> */}
          {isCompleted(title.id) ? (
            <button
              className="complete-button completed"
              onClick={handleCompleteButton}
            >
              {title.id === "mapRoot" ? "Started" : "Completed"}
              <img className="checkMark" src={CheckMark} alt="" />
            </button>
          ) : (
            <button className="complete-button" onClick={handleCompleteButton}>
              {title.id === "mapRoot" ? "Start" : "Complete"}
            </button>
          )}
        </div>
      </div>
    </div>
  ) : null;
});

export default TitleOverview;
