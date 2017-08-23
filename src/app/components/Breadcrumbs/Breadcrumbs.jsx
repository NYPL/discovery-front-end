import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import appConfig from '../../../../appConfig.js';

const baseUrl = appConfig.baseUrl;

const Breadcrumbs = ({ query = '', type, bibUrl, itemUrl, edd }) => {
  const defaultText = appConfig.displayTitle;
  const homeLink = <li key="home"><Link to={`${baseUrl}/`}>{defaultText}</Link></li>;

  /*
   * getCrumbs()
   * Returns an array of list elements to render for the breadcrumbs navigation.
   * This will keep pushing new elements onto an array until it reaches the spot desired.
   * It will then return the list up to that point with the desired spot being a simple
   * text list element.
   * @returns {array}
   */
  const getCrumbs = () => {
    // The first link is the homepage and it will being appearing starting from the
    // Search Results page.
    const crumbs = [
      homeLink,
    ];

    if (type === 'search') {
      crumbs.push(<li key="search">Search Results</li>);
      return crumbs;
    }

    crumbs.push(
      <li key="search"><Link to={`${baseUrl}/search?${query}`}>Search Results</Link></li>
    );

    if (type === 'bib') {
      crumbs.push(<li key="bib">Item Details</li>);
      return crumbs;
    }

    crumbs.push(<li key="bib"><Link to={`${baseUrl}${bibUrl}`}>Item Details</Link></li>);

    if (type === 'hold') {
      crumbs.push(<li key="hold">Item Request</li>);
      return crumbs;
    }

    crumbs.push(<li key="hold"><Link to={`${baseUrl}${itemUrl}`}>Item Request</Link></li>);

    if (type === 'edd') {
      crumbs.push(<li key="edd">Electronic Delivery Request</li>);
      return crumbs;
    }

    // If you came from the EDD form, then you want a link in the breadcrumbs for it.
    if (edd) {
      crumbs.push(
        <li key="edd">
          <Link to={`${baseUrl}${itemUrl}/edd`}>Electronic Delivery Request</Link>
        </li>
      );
    }

    // The last possible point in the breadcrumbs will be the Confirmation page.
    crumbs.push(<li key="confirmation">Request Confirmation</li>);
    return crumbs;
  };

  const crumbs = getCrumbs();

  return (
    <nav aria-label="Breadcrumbs" className="nypl-breadcrumbs">
      <span className="nypl-screenreader-only">You are here:</span>
      <ol>
        {crumbs}
      </ol>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  query: PropTypes.string,
  type: PropTypes.string,
  bibUrl: PropTypes.string,
  itemUrl: PropTypes.string,
  edd: PropTypes.bool,
};

export default Breadcrumbs;
