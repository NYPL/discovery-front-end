// ACTIONS
import alt from '../alt.js';

class Actions {
  updateSearchResults(data) {
    return data;
  }

  updateSearchKeywords(data) {
    return data;
  }

  updateBib(data) {
    return data;
  }

  updateFacets(data) {
    return data;
  }

  updateSelectedFacets(data) {
    return data;
  }

  updatePatronData(data) {
    return data;
  }

  removeFacet(field) {
    return field;
  }

  updatePage(page) {
    return page;
  }

  updateSortBy(sort) {
    return sort;
  }

  updateSpinner(data) {
    return data;
  }
}

export default alt.createActions(Actions);
