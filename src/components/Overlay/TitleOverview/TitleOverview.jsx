import { forwardRef, useContext, useEffect, useRef } from "react";
import CheckMark from "@/assets/checkMark.svg";
import { UniverseContext } from "@/routes/FranchisePage/FranchisePage";
import "./overview.css";
import { GlobalContext } from "@/GlobalState";
import SignInButton from "@/components/common/SignInButton";
import { configureStore } from "@reduxjs/toolkit";

const TitleOverview = forwardRef(function (props, overviewRef) {
  const { user, completed, setCompleted } = useContext(GlobalContext);
  const { elements, universe, isCompleted, layout } =
    useContext(UniverseContext);
  const { title } = props;

  const infoRef = useRef(null);

  useEffect(() => {
    if (!title) return;

    if (infoRef.current) {
      infoRef.current.scrollTop = 0;
    }
  }, [title]);

  function getYear() {
    if (!title || !title.releaseDate) return "";
    const releaseDate = new Date(title.releaseDate);
    return releaseDate.getFullYear();
  }

  function getDuration() {
    let duration = title?.duration;
    if (title && title.id === "mapRoot") {
      duration = elements.reduce((acc, element) => {
        if (element.duration) {
          acc += element.duration;
        }
        return acc;
      }, 0);
    } else if (!title || !title.duration) return "";
    const totalMinutes = duration;
    const hours = parseInt(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${
      hours > 0 ? hours + "h " : ""
    }${minutes === 0 ? "" : minutes + "m"}`;
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
    setCompleted(newCompleted);
  }

  return title ? (
    <div className={`overview${" " + layout.value}`} ref={overviewRef}>
      {title && title.imgUrl && (
        <>
          <img className="poster" src={title.imgUrl} alt="" />

          {layout.value === "big" ? (
            <img className="glowing" src={title.smallImgUrl} alt="" />
          ) : null}
        </>
      )}
      <div className="info-action">
        {layout.value === "small" ? (
          <img className="glowing" src={title.smallImgUrl} alt="" />
        ) : null}
        <div className="info" ref={infoRef}>
          <div className="title" style={{ fontSize: getFontSize() }}>
            {title.title}
          </div>
          <div className="specifics">
            {title.id === "mapRoot"
              ? getDuration()
              : `${getYear()} · ${getDuration()}`}
          </div>
          <div className="description">{title.description}</div>
        </div>
        <div className="action-bar">
          {!user ? (
            <SignInButton className={"overview-login"}>
              Log in to save the progress
            </SignInButton>
          ) : null}

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
