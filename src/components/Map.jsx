import { useEffect, useState } from "react";

const Map = ({ universe }) => {
  const rowHeight = 50;
  const branch = universe.branches[0];
  const [xLevels, setXLevels] = useState([]);
  const [yLevels, setYlevels] = useState(0);

  useEffect(() => {
    let xLevels = [];
    branch.titles.forEach((title) => {
      const lvl = getXLevel(title.id);
      while (xLevels.length < lvl + 1) {
        xLevels.push([]);
      }
      xLevels[lvl].push(title);
    });
    setXLevels(xLevels);
  }, []);

  useEffect(() => {
    if (!xLevels || xLevels.length === 0) return;
    let updatedXLevels = xLevels;
    console.log(updatedXLevels);
    updatedXLevels[0] = updatedXLevels[0].map((element, index) => {
      element.yLevel = index;
      return element;
    });
    setXLevels(updatedXLevels);
  }, [xLevels]);

  console.log(xLevels);

  function getXLevel(id) {
    let level = 0;
    let step = branch.titles[id];
    while (step.watchAfter.length !== 0) {
      level++;
      let highestLevelIndex;
      for (let i = 0; i < step.watchAfter.length; i++) {
        if (
          highestLevelIndex != undefined
            ? getXLevel(step.watchAfter[i]) >
              getXLevel(step.watchAfter[highestLevelIndex])
            : true
        )
          highestLevelIndex = i;
      }
      step = branch.titles[step.watchAfter[highestLevelIndex]];
    }
    return level;
  }

  function getYLevel(id) {
    const level = 0;
    const element = branch.titles[id];
    if (element.watchAfter.length === 0) {
      level = yLevels;
      setYlevels((prev) => prev++);
      return level;
    }
  }

  function getChildren(id) {
    const filteredChildren = children.filter((child) =>
      child.watchAfter.includes(id)
    );
    console.log(filteredChildren);
    return filteredChildren;
  }

  return (
    <div className="map-frame">
      <div className="header">{universe.title}</div>
      <div className="map-container">
        <div className="map">
          {xLevels &&
            xLevels.map((level, index) => <Level key={index} items={level} />)}
        </div>
      </div>
    </div>
  );
};

export default Map;

const Level = ({ items }) => {
  return (
    <div className="level">
      {items.map((item) => (
        <Element key={item.id} item={item} />
      ))}
    </div>
  );
};

const Element = ({ item }) => {
  return (
    <div
      id={item.id}
      className="element"
      style={item.yLevel ? { top: `${60 * item.yLevel}px` } : null}
    >
      <p className="title">{item.title}</p>
    </div>
  );
};

// const Branch = ({ element, children }) => {
//   const [firstChildren, setChildren] = useState(null);

//   useState(() => {
//     //console.log(branch.titles);
//     let filteredChildren = children.filter(
//       (child) => child.watchAfter.length === 0
//     );

//     filteredChildren = (filteredChildren.length > 0 ? filteredChildren : children).map((child) => {
//       child.children = getChildren(child.id);
//       return child;
//     });

//     setChildren(filteredChildren);
//     console.log(filteredChildren);
//   }, []);

//   function getChildren(id) {
//     const filteredChildren = children.filter((child) =>
//       child.watchAfter.includes(id)
//     );
//     console.log(filteredChildren);
//     // console.log("Children for  " + id + "  : " + children);
//     return filteredChildren;
//   }

//   return (
//     <div className="branch">
//       {firstChildren && <Pack items={firstChildren}></Pack>}
//     </div>
//   );
// };

// const Pack = ({ items }) => {
//   return (
//     <div className="pack">
//       {items && items.map((item) => <Branch key={item.id} children={item.children} />)}
//     </div>
//   );
// };

// const Element = ({ item, children }) => {
//   return (
//     <div id={item.id} className="element">
//       <p className="title">{item.title}</p>
//       {item.children && <Pack items={item.children}></Pack>}
//     </div>
//   );
// };

// const Row = ({ children, height }) => {
//   return (
//     <div className="row" style={{ height: height }}>
//       {children}
//       <div className="top-line"></div>
//       <div className="bot-line"></div>
//     </div>
//   );
// };
// const Fragment = () => {
//   return <div className="fragment"></div>;
// };
