import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import {
  isEmpty as _isEmpty,
  isArray as _isArray,
} from 'underscore';
import { useSelector, useDispatch } from 'react-redux';

import LibraryItem from '../../utils/item';
import {
  trackDiscovery,
} from '../../utils/utils';
import ItemTable from '../Item/ItemTable';
import appConfig from '../../data/appConfig';
import { searchResultItemsListLimit as itemTableLimit } from '../../data/constants';
import ItemSorter from '../../utils/itemSorter';


export const getBibTitle = (bib) => {
  if (!bib.titleDisplay || !bib.titleDisplay.length) {
    const author = bib.creatorLiteral && bib.creatorLiteral.length ?
      ` / ${bib.creatorLiteral[0]}` : '';
    return bib.title && bib.title.length ? `${bib.title[0]}${author}` : '';
  }
  return bib.titleDisplay[0];
};

export const getYearDisplay = (bib) => {
  if (_isEmpty(bib)) return null;

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
};

const ResultsList = ({
  results,
  subjectHeadingShow,
  searchKeywords,
}, { router }) => {
  const { features, loading } = useSelector(state => ({
    features: state.features,
    loading: state.loading,
  }));

  const dispatch = useDispatch();
  const updateResultSelection = data => dispatch({
    type: 'UPDATE_RESULT_SELECTION',
    payload: data,
  });

  const {
    pathname,
    search,
  } = router.location;

  const includeDrbb = features.includes('drb-integration');

  if (!results || !_isArray(results) || !results.length) {
    return null;
  }

  const generateBibLi = (bib, i) => {
    // eslint-disable-next-line no-mixed-operators
    if (_isEmpty(bib) || bib.result && (_isEmpty(bib.result) || !bib.result.title)) {
      return null;
    }

    const result = bib.result || bib;
    const bibTitle = getBibTitle(result);
    const bibId = result && result['@id'] ? result['@id'].substring(4) : '';
    const materialType = result && result.materialType && result.materialType[0] ?
      result.materialType[0].prefLabel : null;
    const yearPublished = getYearDisplay(result);
    const publicationStatement = result.publicationStatement && result.publicationStatement.length ?
      result.publicationStatement[0] : '';
    const items = (result.checkInItems || []).concat(ItemSorter.sortItems(LibraryItem.getItems(result)));
    const totalItems = (result.checkInItems || []).length + result.numItems;
    const hasRequestTable = items.length > 0;
    const { baseUrl } = appConfig;
    const bibUrl = `${baseUrl}/bib/${bibId}`;

    return (
      <li key={i} className={`nypl-results-item ${hasRequestTable ? 'has-request' : ''}`}>
        <h3>
          <Link
            onClick={() => {
              updateResultSelection({
                fromUrl: `${pathname}${search}`,
                bibId,
              });
              trackDiscovery('Bib', bibTitle);
            }}
            to={bibUrl}
            className="title"
          >
            {bibTitle}
          </Link>
        </h3>
        <div className="nypl-results-item-description">
          <ul>
            <li className="nypl-results-media">{materialType}</li>
            <li className="nypl-results-publication">{publicationStatement}</li>
            {yearPublished}
            {
              totalItems > 0 ?
                <li className="nypl-results-info">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </li>
                : ''
            }
          </ul>
        </div>
        {
          hasRequestTable &&
          <ItemTable
            items={items.slice(0, itemTableLimit)}
            bibId={bibId}
            id={null}
            searchKeywords={searchKeywords}
            page="SearchResults"
          />
        }
      </li>
    );
  };

  const resultsElm = results.map((bib, i) => generateBibLi(bib, i));

  return (
    <ul
      id="nypl-results-list"
      className={
        `nypl-results-list${loading ? ' hide-results-list' : ''}${includeDrbb && !subjectHeadingShow ? ' drbb-integration' : ''}`
      }
    >
      {resultsElm}
    </ul>
  );
};

ResultsList.propTypes = {
  results: PropTypes.array,
  searchKeywords: PropTypes.string,
  subjectHeadingShow: PropTypes.bool,
};

ResultsList.contextTypes = {
  router: PropTypes.object,
};

export default ResultsList;
