export class MapFunctionality {
  constructor(
    mapContainer,
    shift,
    elementStyle,
    scale,
    mapStyle,
    elements,
    page,
    map
  ) {
    this.mapContainer = mapContainer;
    this.shift = shift;
    this.elementStyle = elementStyle;
    this.scale = scale;
    this.mapStyle = mapStyle;
    this.elements = elements;
    this.page = page;
    this.map = map;
  }

  scrollToElement(id, smooth = true, shift = this.shift) {
    const element = document.getElementById(id);
    if (!element) return;
    const x = element.getBoundingClientRect().x;
    const y = element.getBoundingClientRect().y;

    const elementWidth = parseInt(window.getComputedStyle(element).width);
    const elementHeight = parseInt(window.getComputedStyle(element).height);

    const currentScrollLeft = this.mapContainer.scrollLeft;
    const currentScrollTop = this.mapContainer.scrollTop;

    const offsetX = this.mapContainer.getBoundingClientRect().x;
    const offsetY = this.mapContainer.getBoundingClientRect().y;

    const windowWidth = this.mapContainer.getBoundingClientRect().width;
    const windowHeight = this.mapContainer.getBoundingClientRect().height;

    const newScrollLeft =
      currentScrollLeft +
      x -
      offsetX -
      windowWidth / 2 +
      (elementWidth * this.scale) / 2 -
      shift.x / 2;

    const newScrollTop =
      currentScrollTop +
      y -
      offsetY -
      windowHeight / 2 +
      (elementHeight * this.scale) / 2 -
      shift.y / 2;

    if (smooth)
      smoothScrollTo(this.mapContainer, newScrollLeft, newScrollTop, 500);
    else {
      this.mapContainer.scrollLeft = newScrollLeft;
      this.mapContainer.scrollTop = newScrollTop;
    }
  }

  updateScroll(oldZoom) {
    if (!this.mapStyle) return;
    const oldScale = oldZoom.scale;

    const windowWidth = this.mapContainer.getBoundingClientRect().width;
    const windowHeight = this.mapContainer.getBoundingClientRect().height;

    const offsetX = this.page.getBoundingClientRect().x;
    const offsetY = this.page.getBoundingClientRect().y;

    const mapX = oldZoom.mapX
      ? oldZoom.mapX
      : this.map.getBoundingClientRect().x - offsetX;
    const mapY = oldZoom.mapY
      ? oldZoom.mapY
      : this.map.getBoundingClientRect().y - offsetY;

    const mapWidth = parseInt(this.map.style.width);
    const mapHeight = parseInt(this.map.style.minHeight);
    const heightDifference = oldZoom.mapPadding
      ? parseInt(this.map.style.paddingTop) - parseInt(oldZoom.mapPadding)
      : 0;

    const windowCenterXRatio =
      (-mapX + windowWidth / 2 + this.shift.x / 2) / (mapWidth * oldScale);
    const windowCenterYRatio =
      (-mapY + windowHeight / 2 + this.shift.y / 2) / (mapHeight * oldScale);

    const windowCenterX = windowCenterXRatio * mapWidth;

    const windowCenterY =
      windowCenterYRatio * mapHeight -
      parseInt(this.map.style.paddingTop) +
      heightDifference;

    const dot = document.createElement("div");
    dot.classList.add("dot");
    dot.setAttribute("id", "scrollAnchor");
    dot.style.transform = `translate(${windowCenterX}px, ${windowCenterY}px)`;
    this.map.appendChild(dot);

    this.scrollToElement(dot.id, false);
    dot.remove();
  }

  updateMapStyle(
    mapScale = this.scale,
    elements = this.elements.all,
    resized = false
  ) {
    let highestTitle;
    let lowestTitle;
    let rightTitle;

    if (elements.length === 0) return;
    elements.forEach((title) => {
      if (!highestTitle) highestTitle = title;
      if (!lowestTitle) lowestTitle = title;
      if (!rightTitle) rightTitle = title;

      if (title.yLevel < highestTitle.yLevel) highestTitle = title;
      else if (title.yLevel > lowestTitle.yLevel) {
        lowestTitle = title;
      }
      if (title.xLevel > rightTitle.xLevel) {
        rightTitle = title;
      }
    });

    const mapHeight =
      (lowestTitle.yLevel - highestTitle.yLevel) *
        (this.elementStyle.height + this.elementStyle.marginBot) +
      this.elementStyle.height;
    const paddingTop =
      Math.abs(highestTitle.yLevel) *
      (this.elementStyle.height + this.elementStyle.marginBot);
    const mapWidth =
      rightTitle.xLevel *
        (this.elementStyle.width + this.elementStyle.marginRight) +
      this.elementStyle.width;

    const mapContainerSize = this.page.getBoundingClientRect();
    const initialMarginLeft = mapContainerSize.width / 1.5;
    const initialMarginRight = mapContainerSize.width / 1.5;
    const initialMarginTop = mapContainerSize.height / 1.5;
    const initialMarginBot = mapContainerSize.height / 1.5;

    const marginLeft = initialMarginLeft + (mapWidth * (mapScale - 1)) / 2;
    const marginTop = initialMarginTop + (mapHeight * (mapScale - 1)) / 2;

    const marginRight = initialMarginRight + (mapWidth * (mapScale - 1)) / 2;
    const marginBot = initialMarginBot + (mapHeight * (mapScale - 1)) / 2;

    const containerWidth = this.page.getBoundingClientRect().width;
    const containerHeight = this.page.getBoundingClientRect().height;

    const overviewLayout = this.mapContainer
      ? containerHeight < containerWidth
        ? "big"
        : "small"
      : null;

    const style = {
      width: mapWidth,
      minHeight: mapHeight,
      paddingTop: paddingTop,
      initialMargin: {
        left: initialMarginLeft,
        right: initialMarginRight,
        top: initialMarginTop,
        bot: initialMarginBot,
      },
      margin: {
        left: marginLeft,
        right: marginRight,
        top: marginTop,
        bot: marginBot,
      },
      overlayLayout: overviewLayout,
      resized: resized,
    };

    return style;
  }

  getAllFillerParents(element) {
    const fillers = [];
    element.watchAfter.forEach((parentId) => {
      const element = this.elements.all.find(
        (element) => element.id === parentId
      );
      if (element.branch === "line-filler") {
        fillers.push(element);
        fillers.push(...this.getAllFillerParents(element));
      }
    });
    return fillers;
  }
}

export function getAllParentElements(
  elementId,
  elements,
  untilCompleted = false,
  completedIds
) {
  const element = elements.find((element) => element.id === elementId);
  if (!element) return [];
  const watchAfter = new Set();
  if (
    element.standAlone ||
    (untilCompleted && completedIds.includes(element.id))
  )
    return [...watchAfter];

  getDirectParents(element, elements).forEach((parent) => {
    if (untilCompleted && completedIds.includes(parent.id)) return;
    watchAfter.add(parent);
  });

  element.watchAfter.forEach((id) => {
    const element = elements.find((element) => element.id === id);
    if (!element || (untilCompleted && completedIds.includes(element.id)))
      return;
    watchAfter.add(element);

    if (element.standAlone) return;
    getAllParentElements(
      element.id,
      elements,
      untilCompleted,
      completedIds
    ).forEach((element) => {
      if (untilCompleted && completedIds.includes(id)) return;
      watchAfter.add(element);
    });
  });
  return [...watchAfter];
}

export function getDirectParents(element, elements = this.elements.all) {
  const directParents = [];
  element.watchAfter.forEach((parentId) => {
    let notFiller = elements.find((element) => element.id === parentId);
    while (notFiller.branch === "line-filler") {
      notFiller = elements.find(
        (element) => element.id === notFiller.watchAfter[0]
      );
    }
    directParents.push(notFiller);
  });
  return directParents;
}

function smoothScrollTo(container, targetX, targetY, duration) {
  const startX = container.scrollLeft;
  const startY = container.scrollTop;
  const distanceX = targetX - startX;
  const distanceY = targetY - startY;
  const startTime = performance.now();

  function step() {
    const currentTime = performance.now();
    const elapsedTime = currentTime - startTime;
    const scrollProgress = Math.min(elapsedTime / duration, 1);
    const scrollPositionX = startX + distanceX * easeInOutQuad(scrollProgress);
    const scrollPositionY = startY + distanceY * easeInOutQuad(scrollProgress);

    container.scrollLeft = scrollPositionX;
    container.scrollTop = scrollPositionY;

    if (scrollProgress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
