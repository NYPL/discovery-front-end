import React from 'react';
import {
  mapObject as _mapObject,
  each as _each,
  isEmpty as _isEmpty,
  isArray as _isArray,
  keys as _keys,
} from 'underscore';

import Actions from '../../actions/Actions';
import ClearHits from './ClearHits';
import { ajaxCall } from '../../utils/utils';

class Hits extends React.Component {
  constructor(props) {
    super(props);

    this.removeFacet = this.removeFacet.bind(this);
    this.getKeyword = this.getKeyword.bind(this);
    this.getFacetElements = this.getFacetElements.bind(this);
    this.getFacetLabel = this.getFacetLabel.bind(this);
  }

  getKeyword(keyword) {
    if (keyword) {
      return (
        <span className="nypl-facet">&nbsp;keywords <strong>{keyword}</strong>
          <button
            onClick={() => this.removeKeyword(keyword)}
            className="remove-keyword"
            aria-controls="results-region"
          >
            <svg className="nypl-icon" preserveAspectRatio="xMidYMid meet" viewBox="0 0 10 10" aria-hidden="true">
              <title>times.icon</title>
              <polygon points="2.3,6.8 3.2,7.7 5,5.9 6.8,7.7 7.7,6.8 5.9,5 7.7,3.2 6.8,2.3 5,4.1 3.2,2.3 2.3,3.2 4.1,5 "></polygon>
            </svg>
            <span className="hidden">remove keyword filter&nbsp;{keyword}</span>
          </button>
        </span>
      );
    }

    return null;
  }

  getFacetLabel(field) {
    if (field === 'materialType') {
      return 'Material Type';
    } else if (field === 'subjectLiteral') {
      return 'Subject';
    } else if (field === 'creatorLiteral') {
      return 'Author';
    } else if (field.indexOf('date') !== -1) {
      return 'Date';
    }
    return field.charAt(0).toUpperCase() + field.slice(1);
  }

  getFacetElements(facets) {
    if (_isEmpty(facets)) return null;
    const renderedElms = [];
    const filterLen = _keys(facets).length - 1;
    let j = 0;
    _mapObject(facets, (value, key) => {
      _each(value, (facet, i) => {
        renderedElms.push(
          <span key={`${key}-${i}`} className="nypl-facet">
            {this.getFacetLabel(key)} <strong>{facet.value}</strong>
            <button
              onClick={() => this.removeFacet(key, facet.id)}
              className="remove-facet"
              aria-controls="results-region"
            >
              <svg className="nypl-icon" preserveAspectRatio="xMidYMid meet" viewBox="0 0 10 10" aria-hidden="true">
                <title>times.icon</title>
                <polygon points="2.3,6.8 3.2,7.7 5,5.9 6.8,7.7 7.7,6.8 5.9,5 7.7,3.2 6.8,2.3 5,4.1 3.2,2.3 2.3,3.2 4.1,5 "></polygon>
              </svg>
              <span className="hidden">remove filter&nbsp;{facet.value}</span>
            </button>
          </span>
        );
        if (i < value.length - 1) {
          renderedElms.push(<span key={`value-comma-${i}`}>, </span>);
        }
      });

      if (j < filterLen) {
        renderedElms.push(<span key={`filter-comma-${j}`}>, </span>);
      }
      j++;
    });

    return renderedElms;
  }

  removeKeyword() {
    Actions.updateSpinner(true);
    Actions.updateSearchKeywords('');

    const apiQuery = this.props.createAPIQuery({ searchKeywords: '' });

    ajaxCall(`/api?${apiQuery}`, (response) => {
      Actions.updateSearchResults(response.data.searchResults);
      Actions.updateFacets(response.data.facets);
      Actions.updatePage('1');
      this.context.router.push(`/search?${apiQuery}`);
      Actions.updateSpinner(false);
    });
  }

  removeFacet(facetKey, valueId) {
    Actions.updateSpinner(true);
    Actions.removeFacet(facetKey, valueId);

    const apiQuery = this.props.createAPIQuery({ selectedFacets: this.props.selectedFacets });

    ajaxCall(`/api?${apiQuery}`, (response) => {
      Actions.updateSearchResults(response.data.searchResults);
      Actions.updateFacets(response.data.facets);
      Actions.updatePage('1');
      this.context.router.push(`/search?${apiQuery}`);
      Actions.updateSpinner(false);
    });
  }

  displayClear() {
    const {
      selectedFacets,
      searchKeywords,
    } = this.props;

    if (selectedFacets.length || searchKeywords.length) {
      return (<ClearHits />);
    }
    return null;
  }

  displayResultsCount() {
    const {
      selectedFacets,
      hits,
      searchKeywords,
    } = this.props;
    const activeFacets = {};
    const hitsF = hits ? hits.toLocaleString() : '';

    _mapObject(selectedFacets, (val, key) => {
      if (key === 'dateAfter' || key === 'dateBefore') {
        // Converting the date object value into an array of one object
        // just for rendering purposes.
        if (!_isEmpty(val) && val.id) {
          activeFacets[key] = [];
          activeFacets[key].push(val);
        }
      } else if (val.length && _isArray(val)) {
        activeFacets[key] = [];
        _each(val, facet => {
          if (facet.value) {
            activeFacets[key].push({ id: facet.id, value: facet.value });
          }
        });
      }
    });

    const keyword = this.getKeyword(searchKeywords);
    const activeFacetsElm = this.getFacetElements(activeFacets);
    if (this.props.spinning) {
      return (<h2><strong className="nypl-results-count">Loading…</strong></h2>);
    }
    if (hits !== 0) {
      return (
        <h2>
          <strong className="nypl-results-count">{hitsF}</strong>
           results found for {keyword}{keyword && activeFacetsElm && ', '}{activeFacetsElm}.
        </h2>);
    }
    return (<h2>No results found for {keyword}{activeFacetsElm}.</h2>);
  }

  render() {
    const activeResultsCount = this.displayResultsCount();
    const clearHits = this.displayClear();
    return (
      <div
        id="results-description"
        className="nypl-results-summary"
        aria-live="assertive"
        aria-atomic="true"
        role="presentation"
      >
        {activeResultsCount}
        {clearHits}
      </div>
    );
  }
}

Hits.propTypes = {
  hits: React.PropTypes.number,
  searchKeywords: React.PropTypes.string,
  spinning: React.PropTypes.bool,
  selectedFacets: React.PropTypes.object,
  createAPIQuery: React.PropTypes.func,
};

Hits.defaultProps = {
  hits: 0,
  spinning: false,
};

Hits.contextTypes = {
  router: function contextType() {
    return React.PropTypes.func.isRequired;
  },
};

export default Hits;
