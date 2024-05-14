import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import { ElementsContext } from "./Map";

const TitleOverview = forwardRef(function (props, overviewRef) {
  const { title, frameRef, focusElement, className } = props;
  const { elements, map } = useContext(ElementsContext);
  const [directParents, setDirectParents] = useState([]);
  const [watchAfter, setWatchAfter] = useState([]);

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

  return title ? (
    <div className={"overview " + className} ref={overviewRef}>
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

export default TitleOverview;
