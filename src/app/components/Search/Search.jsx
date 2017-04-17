import React from 'react';

import Actions from '../../actions/Actions.js';
import Store from '../../stores/Store.js';

import SearchButton from '../Buttons/SearchButton.jsx';
import {
  trackDiscovery,
  ajaxCall,
  getSortQuery,
  getFacetParams,
} from '../../utils/utils.js';

import {
  extend as _extend,
} from 'underscore';

/**
 * The main container for the top Search section.
 */
class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = _extend({
      placeholder: 'Keyword, title, name, or id',
      placeholderAnimation: null,
      noAnimationBefore: true,
    }, Store.getState());

    this.inputChange = this.inputChange.bind(this);
    this.submitSearchRequest = this.submitSearchRequest.bind(this);
    this.triggerSubmit = this.triggerSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.routeHandler = this.routeHandler.bind(this);
  }

  componentDidMount() {
    Store.listen(this.onChange);
  }

  componentWillUnmount() {
    Store.unlisten(this.onChange);
  }

  onChange() {
    this.setState(_extend(this.state, Store.getState()));
  }

  /**
   * submitSearchRequest()
   */
  submitSearchRequest(e) {
    e.preventDefault();

    // Store the data that the user entered
    const keyword = this.state.searchKeywords.trim();
    const sortQuery = getSortQuery(this.props.sortBy);
    const facetQuery = getFacetParams(this.props.selectedFacets);

    // Track the submitted keyword search.
    trackDiscovery('Search', keyword);

    ajaxCall(`/api?q=${keyword}${facetQuery}${sortQuery}`, (response) => {
      Actions.updateSearchResults(response.data.searchResults);
      Actions.updateFacets(response.data.facets);
      Actions.updateSearchKeywords(keyword);
      Actions.updatePage('1');
      this.routeHandler({
        pathname: '/search',
        query: { q: `${keyword}${facetQuery}${sortQuery}` },
      });
    });
  }

  routeHandler(obj) {
    this.context.router.push(obj);
  }

  /**
   * triggerSubmit(event)
   * The fuction listens to the event of enter key.
   * Submit search request if enter is pressed.
   *
   * @param {Event} event
   */
  triggerSubmit(event) {
    if (event && event.charCode === 13) {
      this.submitSearchRequest(event);
    }
  }

  /**
   * inputChange(field, event)
   * Listen to the changes on keywords input field and option input fields.
   * Grab the event value, and change the state.
   *
   * @param {Event Object} event - Passing event as the argument here
   * as FireFox doesn't accept event as a global variable.
   */
  inputChange(event) {
    this.setState({ searchKeywords: event.target.value });
  }

  render() {
    return (
      <form onKeyPress={this.triggerSubmit}>
      <fieldset className="nypl-omnisearch">
        <SearchButton
          id="nypl-omni-button"
          type="submit"
          value="Search"
          onClick={this.submitSearchRequest}
        />
        <span className="nypl-omni-fields">
          <label forHtml="search-by-field">Search in</label>
          <select id="search-by-field"><option value="all">All fields</option><option value="title">Title</option><option value="contributor">Author/Contributor</option><option value="subject">Subject</option><option value="series">Series</option><option value="call_number">Call number</option></select>
        </span>
        <input
          type="text"
          id="search-query"
          aria-labelledby="nypl-omni-button"
          placeholder={this.state.placeholder}
          onChange={this.inputChange}
          value={this.state.searchKeywords}
          ref="keywords"
        />
      </fieldset>
      </form>
    );
  }
}

Search.propTypes = {
  sortBy: React.PropTypes.string,
  selectedFacets: React.PropTypes.object,
};

Search.contextTypes = {
  router: function contextType() {
    return React.PropTypes.func.isRequired;
  },
};

export default Search;
