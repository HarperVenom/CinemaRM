const Tree = ({ scale }) => {
  const elementWidth = 230 * initialScale;
  const elementMarginRight = 230 * initialScale;
  const elementHeight = 60 * initialScale;
  const elementMarginBot = 60 * initialScale;
  const elementStyle = {
    width: elementWidth,
    height: elementHeight,
    marginRight: elementMarginRight,
    marginBot: elementMarginBot,
  };

  return (
    <div
      className="map"
      ref={mapRef}
      style={{
        width: mapStyle && `${mapStyle.width}px`,
        minHeight: mapStyle && `${mapStyle.minHeight}px`,
        paddingTop: mapStyle && `${mapStyle.paddingTop}px`,
        margin: mapStyle && `${mapStyle.margin.y}px ${mapStyle.margin.x}px`,
        transform: `scale(${scale})`,
      }}
    >
      <div className="level">
        {elements &&
          elements.map((title) => (
            <Element
              key={title.id}
              item={title}
              style={elementStyle}
              onClick={handleElementClick}
            />
          ))}
        <svg className="trails"></svg>
      </div>
    </div>
  );
};

export default Tree;
