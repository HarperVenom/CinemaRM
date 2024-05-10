export class MapFunctionality {
  constructor(
    mapContainer,
    shift,
    elementStyle,
    scale,
    mapStyle,
    elements,
    wrapper
  ) {
    this.mapContainer = mapContainer;
    this.shift = shift;
    this.elementStyle = elementStyle;
    this.scale = scale;
    this.mapStyle = mapStyle;
    this.elements = elements;
    this.wrapper = wrapper;
  }

  scrollToElement(id, smooth = true, shift = this.shift) {
    const element = document.getElementById(id);
    if (!element) return;
    const x = element.getBoundingClientRect().x;
    const y = element.getBoundingClientRect().y;

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
      (this.elementStyle.width * this.scale) / 2 -
      shift.x / 2;

    const newScrollTop =
      currentScrollTop +
      y -
      offsetY -
      windowHeight / 2 +
      (this.elementStyle.height * this.scale) / 2 -
      shift.y / 2;

    if (smooth)
      smoothScrollTo(this.mapContainer, newScrollLeft, newScrollTop, 500);
    else {
      this.mapContainer.scrollLeft = newScrollLeft;
      this.mapContainer.scrollTop = newScrollTop;
    }
  }

  updateScroll(oldZoom, newScale = this.scale) {
    if (!this.mapStyle) return;
    const oldScale = oldZoom.scale;

    const oldScroll = {
      x: oldZoom.scrollX + this.shift.x / 2,
      y: oldZoom.scrollY + this.shift.y / 2,
    };

    const initialWidth =
      this.mapStyle.width + this.mapStyle.initialMargin.x * 2;
    const initialHeight =
      this.mapStyle.minHeight +
      this.mapStyle.paddingTop +
      this.mapStyle.initialMargin.y * 2;

    const oldWidth = initialWidth * oldScale;
    const newWidth = initialWidth * newScale;

    const oldHeight = initialHeight * oldScale;
    const newHeight = initialHeight * newScale;

    const xRation = oldScroll.x / oldWidth;
    const yRation = oldScroll.y / oldHeight;

    const newScroll = {
      x: newWidth * xRation - this.shift.x / 2,
      y: newHeight * yRation - this.shift.y / 2,
    };

    this.mapContainer.scrollLeft = newScroll.x;
    this.mapContainer.scrollTop = newScroll.y;
  }

  updateMapStyle(
    mapScale = this.scale,
    elements = this.elements,
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

    const mapContainerSize = this.wrapper.getBoundingClientRect();
    const marginHorizontal =
      mapContainerSize.width / 2 + (mapWidth * (mapScale - 1)) / 2;
    const marginVertical =
      mapContainerSize.height / 2 + (mapHeight * (mapScale - 1)) / 2;

    const overviewLayout = this.mapContainer
      ? this.mapContainer.getBoundingClientRect().width > 1000
        ? "left"
        : "bot"
      : "left";

    const style = {
      width: mapWidth,
      minHeight: mapHeight,
      paddingTop: paddingTop,
      initialMargin: {
        x: mapContainerSize.width / 2,
        y: mapContainerSize.height / 2,
      },
      margin: {
        x: marginHorizontal,
        y: marginVertical,
      },
      overviewLayout: overviewLayout,
      resized: resized,
    };

    return style;
  }
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
