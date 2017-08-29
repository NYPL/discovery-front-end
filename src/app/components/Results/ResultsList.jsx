import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { isEmpty as _isEmpty } from 'underscore';

import Actions from '../../actions/Actions';
import LibraryItem from '../../utils/item';
import { ajaxCall } from '../../utils/utils';
import ItemTable from '../Item/ItemTable';
import appConfig from '../../../../appConfig.js';

class ResultsList extends React.Component {
  constructor(props) {
    super(props);

    this.routeHandler = this.routeHandler.bind(this);
    this.getBibRecord = this.getBibRecord.bind(this);
    this.getItemRecord = this.getItemRecord.bind(this);
  }

  /*
   * getBibRecord(e, bibId)
   * @description Get updated information for a bib and route the patron to the bib page.
   * @param {object} e Event object.
   * @param {string} bibId The bib's id.
   */
  getBibRecord(e, bibId) {
    e.preventDefault();

    ajaxCall(`${appConfig.baseUrl}/api/bib?bibId=${bibId}`,
      (response) => {
        Actions.updateBib(response.data);

        this.routeHandler(`${appConfig.baseUrl}/bib/${bibId}`);
      },
      error => {
        console.error(
          'Error attempting to make an ajax request to fetch a bib record from ResultsList',
          error
        );
      }
    );
  }

  /*
   * getItemRecord(e, bibId, itemId)
   * @description Get updated information for an item along with its delivery locations.
   * And then route the patron to the hold request page.
   * @param {object} e Event object.
   * @param {string} bibId The bib's id.
   * @param {string} itemId The item's id.
   */
  getItemRecord(e, bibId, itemId) {
    e.preventDefault();

    ajaxCall(`${appConfig.baseUrl}/api/hold/request/${bibId}-${itemId}`,
      (response) => {
        Actions.updateBib(response.data.bib);
        Actions.updateDeliveryLocations(response.data.deliveryLocations);
        Actions.updateIsEddRequestable(response.data.isEddRequestable);

        this.routeHandler(`${appConfig.baseUrl}/hold/request/${bibId}-${itemId}`);
      },
      error => {
        console.error(
          'Error attemping to make an ajax request to fetch an item in ResultsList',
          error
        );
      }
    );
  }

  getCollapsedBibs(collapsedBibs) {
    if (!collapsedBibs.length) return null;

    const bibs = collapsedBibs.map((bib, i) => this.getBib(bib, false, i));

    return (
      <div className="related-items">
        <h4>Related formats and editions</h4>
        <ul>
          {bibs}
        </ul>
      </div>
    );
  }

  getBibTitle(bib) {
    if (!bib.titleDisplay) {
      const author = bib.creatorLiteral && bib.creatorLiteral.length ?
        ` / ${bib.creatorLiteral[0]}` : '';
      return bib.title && bib.title.length ? `${bib.title[0]}${author}` : '';
    }
    return bib.titleDisplay;
  }

  getYearDisplay(bib) {
    let dateStartYear = bib.dateStartYear;
    let dateEndYear = bib.dateEndYear;

    dateStartYear = dateStartYear === 999 ? 'unknown' : dateStartYear;
    dateEndYear = dateEndYear === 9999 ? 'present' : dateEndYear;

    if (dateStartYear && dateEndYear) {
      return (<li className="nypl-results-date">{dateStartYear}-{dateEndYear}</li>);
    } else if (dateStartYear) {
      return (<li className="nypl-results-date">{dateStartYear}</li>);
    }
    return null;
  }

  getBib(bib, author, i) {
    if (!bib.result || _isEmpty(bib.result) || !bib.result.title) return null;

    const result = bib.result;
    const bibTitle = this.getBibTitle(result);
    const bibId = result && result['@id'] ? result['@id'].substring(4) : '';
    const materialType = result && result.materialType && result.materialType[0] ?
      result.materialType[0].prefLabel : null;
    const yearPublished = this.getYearDisplay(result);
    const publisher = result.publisher && result.publisher.length ? result.publisher[0] : '';
    const placeOfPublication = result.placeOfPublication && result.placeOfPublication.length ?
      result.placeOfPublication[0] : '';
    const items = LibraryItem.getItems(result);
    const totalItems = items.length;

    return (
      <li key={i} className="nypl-results-item">
        <h3>
          <Link
            onClick={(e) => this.getBibRecord(e, bibId)}
            to={`${appConfig.baseUrl}/bib/${bibId}?searchKeywords=${this.props.searchKeywords}`}
            className="title"
          >
            {bibTitle}
          </Link>
        </h3>
        <div className="nypl-results-item-description">
          <ul>
            <li className="nypl-results-media">{materialType}</li>
            <li className="nypl-results-place">{placeOfPublication}</li>
            <li className="nypl-results-publisher">{publisher}</li>
            {yearPublished}
            <li className="nypl-results-info">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </li>
          </ul>
        </div>
        {
          (items.length === 1) &&
            <ItemTable
              items={items}
              bibId={bibId}
              getRecord={this.getItemRecord}
              id={null}
              searchKeywords={this.props.searchKeywords}
            />
        }
      </li>
    );
  }

  routeHandler(route) {
    this.context.router.push(route);
  }

  render() {
    const results = this.props.results;
    let resultsElm = null;

    if (results && results.length) {
      resultsElm = results.map((bib, i) => this.getBib(bib, true, i));
    }

    return (
      <ul
        id="nypl-results-list"
        className={`nypl-results-list ${this.props.isLoading ? 'hide-results-list ' : ''}`}
      >
        {resultsElm}
      </ul>
    );
  }
}

ResultsList.propTypes = {
  results: PropTypes.array,
  isLoading: PropTypes.bool,
  searchKeywords: PropTypes.string,
};

ResultsList.contextTypes = {
  router: PropTypes.object,
};

export default ResultsList;
