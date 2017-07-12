import React from 'react';
import PropTypes from 'prop-types';
import PatronStore from '../../stores/PatronStore.js';
import config from '../../../../appConfig.js';
import { Link } from 'react-router';
import {
  isArray as _isArray,
  isEmpty as _isEmpty,
} from 'underscore';

import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';
import LibraryItem from '../../utils/item.js';

class HoldConfirmation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      patron: PatronStore.getState(),
    };
  }

  componentDidMount() {
    this.requireUser();
  }

  /**
   * requireUser()
   * Redirects the patron to OAuth log in page if he/she hasn't been logged in yet.
   *
   * @return {Boolean}
   */
  requireUser() {
    if (this.state.patron && this.state.patron.id) {
      return true;
    }

    const fullUrl = encodeURIComponent(window.location.href);

    window.location.replace(`${config.loginUrl}?redirect_uri=${fullUrl}`);

    return false;
  }

  /**
   * renderLocationInfo()
   * Renders the location information.
   *
   * @param {Object} loc
   * @return {HTML Element}
   */
  renderLocationInfo(loc) {
    if (!loc || _isEmpty(loc)) { return null; }

    const locName = loc['full-name'] ? loc['full-name'] : '';
    const uri = loc.uri ? <a href={`${loc.uri}`}>{locName}</a> : null;
    const address = (loc.address && loc.address.address1) ? loc.address.address1 : null;
    const prefLabel = (loc.prefLabel) ? loc.prefLabel : null;

    return(
      <p>
        {uri}<br />
        {address}<br />
        {prefLabel}
      </p>
    );
  }

  render() {
    // Need to better clarify variable names later.
    const bib = this.props.bib;
    const title = (bib && _isArray(bib.title) && bib.title.length > 0) ?
      bib.title[0] : '';
    const id = (bib && bib['@id'] && typeof bib['@id'] === 'string') ?
      bib['@id'].substring(4) : '';
    const itemId = (this.props.params && this.props.params.itemId) ? this.props.params.itemId : '';
    const selectedItem = LibraryItem.getItem(bib, itemId);
    // const deliveryLocation = (selectedItem && selectedItem.deliveryLocations.length) ?
    //   selectedItem.deliveryLocations[0] : {};
    const deliveryLocation = { prefLabel: 'test location' };
    const shelfMarkInfo =
      (selectedItem && _isArray(selectedItem.shelfMark) && selectedItem.shelfMark.length > 0) ?
        <li>Call number: {selectedItem.shelfMark[0]}</li> : null;

    return (
      <div id="mainContent">
        <div className="page-header">
          <div className="content-wrapper">
            <Breadcrumbs
              query={this.props.searchKeywords}
              type="holdConfirmation"
              title={title}
              url={id}
            />
          </div>
        </div>

        <div className="content-wrapper">
          <div className="item-header">
            <h1>Research item request confirmation</h1>
          </div>

          <div className="item-summary row">
            <div className="details two-third">
              <h2>Item request details</h2>
              <ul className="generic-list">
                <li>Item: <Link to={`/bib/${id}`}>{title}</Link></li>
                {shelfMarkInfo}
                { /* <li>Ready for use by <strong>approximately {dateDisplay}, 9:00am</strong> at the location below</li> */ }
                <li><strong>You will receive an email notification</strong> when the item is ready for use at the location below</li>
                { /* <li>Book will be held until {dateDisplayEnd}, 5:00pm</li> */ }
              </ul>
            </div>
            <div className="actions third">
              <h2>Available actions</h2>
              <ul className="generic-list">
                <li>Visit your patron account page to view the status of this item hold</li>
                { /* <li>You may <a href="#cancel">cancel</a> this item hold at any time</li> */ }
              </ul>
            </div>
          </div>

          <div className="map-container">
            <div className="third">
              {this.renderLocationInfo(deliveryLocation)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

HoldConfirmation.propTypes = {
  bib: PropTypes.object,
  location: PropTypes.object,
  searchKeywords: PropTypes.string,
  params: PropTypes.object,
};

HoldConfirmation.defaultProps = {
  bib: {},
  searchKeywords: '',
  params: {},
};

export default HoldConfirmation;
