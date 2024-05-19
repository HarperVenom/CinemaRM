import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import { ElementsContext } from "./Map";
import { useDispatch, useSelector } from "react-redux";
import {
  addCompleted,
  selectCompleted,
  selectCompletedUniverse,
} from "../data/userSlice";
import CheckMark from "../assets/checkMark.svg";

const TitleOverview = forwardRef(function (props, overviewRef) {
  const { title, frameRef, focusElement, className } = props;
  const { universe, elements, map } = useContext(ElementsContext);
  const [directParents, setDirectParents] = useState([]);
  const [watchAfter, setWatchAfter] = useState([]);

  const completedTitles = useSelector((state) =>
    selectCompletedUniverse(state, universe.id)
  )?.titles;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!title) return;

    setDirectParents(map.getDirectParents(title));
    setWatchAfter(
      map
        .getAllParentElements(title)
        .filter(
          (element) => element.type !== "line-filler" && element.id !== -1
        )
    );
  }, [title]);

  function getYear() {
    if (!title || !title.release) return "";
    const releaseDate = new Date(title.release);
    return releaseDate.getFullYear();
  }

  function getDuration() {
    if (!title || !title.duration) return "";
    const totalMinutes = title.duration;
    const hours = parseInt(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  function getFontSize() {
    if (!title || !title.title) return;
    const length = title.title.length;
    const newSize = 5 - parseInt(length / 8) / 2;
    return newSize + "vh";
  }

  function handleCompleteButton() {
    const titleToAdd = { id: universe.id, titleId: title.id };
    dispatch(addCompleted(titleToAdd));
  }

  return title ? (
    <div className={"overview " + className} ref={overviewRef}>
      {title && title.img_url && (
        <img className="poster" src={title.img_url} alt="" />
      )}
      <div className="info">
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
        {completedTitles && completedTitles.includes(title.id) ? (
          <button className="complete-button completed">
            Completed
            <img className="checkMark" src={CheckMark} alt="" />
          </button>
        ) : (
          <button className="complete-button" onClick={handleCompleteButton}>
            Complete
          </button>
        )}
      </div>
    </div>
  ) : null;
});

export default TitleOverview;
