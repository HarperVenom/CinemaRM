import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import { ElementsContext } from "./Map";

const MapHeading = forwardRef(function MapHeading(props, headingRef) {
  const { title, frameRef, focusElement } = props;
  const elements = useContext(ElementsContext);
  const [directParents, setDirectParents] = useState([]);
  const [watchAfter, setWatchAfter] = useState([]);

  useEffect(() => {
    if (!title) return;

    setDirectParents(getDirectParents(title));
    setWatchAfter(
      getWatchAfter(title).filter(
        (element) => element.type !== "line-filler" && element.id !== -1
      )
    );

    function getWatchAfter(title) {
      const watchAfter = new Set();
      getDirectParents(title).forEach((parent) => {
        watchAfter.add(parent);
      });
      title.watchAfter.forEach((id) => {
        const element = elements.find((element) => element.id === id);
        if (element.standAlone) return;
        getWatchAfter(element).forEach((element) => {
          watchAfter.add(element);
        });
      });
      return [...watchAfter];
    }
  }, [title]);

  function getDirectParents(element) {
    const directParents = [];
    element.watchAfter.forEach((parentId) => {
      let notFiller = elements.find((element) => element.id === parentId);
      while (notFiller.type === "line-filler") {
        notFiller = elements.find(
          (element) => element.id === notFiller.watchAfter[0]
        );
      }
      directParents.push(notFiller);
    });
    return directParents;
  }

  return title ? (
    <div className="heading" ref={headingRef}>
      <img src={title.img_url} alt="" />
      <div className="info">
        <div className="title">{title.title}</div>
        <div className="description">{title.description}</div>
        <div className="watch-after">
          {watchAfter.length > 0 && !title.standAlone && <h5>Watch first: </h5>}
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
      </div>
    </div>
  ) : null;
});

export default MapHeading;
