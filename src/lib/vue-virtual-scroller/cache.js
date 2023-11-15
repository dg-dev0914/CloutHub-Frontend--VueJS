const scrollData = {};

const saveScrollData = (scrollId, scrollState) => {
  scrollData[scrollId] = scrollState;
};

const getScrollData = (scrollId) => scrollData[scrollId];

export { saveScrollData, getScrollData };
