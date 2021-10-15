/* global window */
import React from 'react';
import PropTypes from 'prop-types';
import { every as _every } from 'underscore';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';

import {
  Heading,
  Link as DSLink,
} from '@nypl/design-system-react-components';

import SccContainer from '../components/SccContainer/SccContainer';
import itemsContainerModule from '../components/Item/ItemsContainer';
import BibDetails from '../components/BibPage/BibDetails';
import LibraryItem from '../utils/item';
import AdditionalDetailsViewer from '../components/BibPage/AdditionalDetailsViewer';
import NotFound404 from '../components/NotFound404/NotFound404';
import LibraryHoldings from '../components/BibPage/LibraryHoldings';
import getOwner from '../utils/getOwner';
import appConfig from '../data/appConfig';
import Redirect404 from '../components/Redirect404/Redirect404';
// Removed MarcRecord because the webpack MarcRecord is not working. Sep/28/2017
// import MarcRecord from './MarcRecord';
import { ajaxCall, isNyplBnumber } from '@utils';
import { updateBibPage } from '@Actions';
import { itemBatchSize } from '../data/constants';

import {
  getAggregatedElectronicResources,
} from '../utils/utils';

import {
  annotatedMarcDetails,
} from '../utils/bibDetailsUtils';

const ItemsContainer = itemsContainerModule.ItemsContainer;

const checkForMoreItems = (bib, dispatch) => {
  if (!bib || !bib.items || !bib.items.length || (bib && bib.done)) {
    // nothing to do
  } else if (bib && bib.items.length < itemBatchSize) {
    // done
    dispatch(updateBibPage({ bib: Object.assign({}, bib, { done: true }) }));
  } else {
    // need to fetch more items
    const baseUrl = appConfig.baseUrl;
    const itemFrom = bib.itemFrom || itemBatchSize;
    const bibApi = `${window.location.pathname.replace(baseUrl, `${baseUrl}/api`)}?itemFrom=${itemFrom}`;
    ajaxCall(
      bibApi,
      (resp) => {
        // put items in
        const bibResp = resp.data.bib;
        const done = !bibResp || !bibResp.items || bibResp.items.length < itemBatchSize;
        dispatch(updateBibPage({
          bib:
            Object.assign(
              {},
              bib,
              { items: bib.items.concat((bibResp && bibResp.items) || []),
                done,
                itemFrom: parseInt(itemFrom, 10) + parseInt(itemBatchSize, 10),
              },
            ),
        }));
      },
      (error) => { console.error(error); },
    );
  }
};

export const BibPage = (props, context) => {
  const {
    location,
    searchKeywords,
    dispatch,
    resultSelection,
  } = props;

  if (!props.bib || parseInt(props.bib.status, 10) === 404) {
    const originalUrl = context &&
      context.router &&
      context.router.location &&
      context.router.location.query &&
      context.router.location.query.originalUrl;

    return originalUrl ? (<Redirect404 />) : (<NotFound404 />);
  }
  const bib = props.bib ? props.bib : {};
  // check whether this is a server side or client side render
  // by whether 'window' is defined. After the first render on the client side
  // check for more items
  if (typeof window !== 'undefined') {
    checkForMoreItems(bib, dispatch);
  }
  const bibId = bib && bib['@id'] ? bib['@id'].substring(4) : '';
  const items = (bib.checkInItems || []).concat(LibraryItem.getItems(bib));
  const isElectronicResources = _every(items, i => i.isElectronicResource);
  // Related to removing MarcRecord because the webpack MarcRecord is not working. Sep/28/2017
  // const isNYPLReCAP = LibraryItem.isNYPLReCAP(bib['@id']);
  // const bNumber = bib && bib.idBnum ? bib.idBnum : '';
  const itemPage = location.search;
  const aggregatedElectronicResources = getAggregatedElectronicResources(items);
  let shortenItems = true;

  if (location.pathname.indexOf('all') === -1) {
    shortenItems = false;
  }

  // `linkable` means that those values are links inside the app.
  // `selfLinkable` means that those values are external links and should be self-linked,
  // e.g. the prefLabel is the label and the URL is the id.
  const topFields = [
    { label: 'Title', value: 'titleDisplay' },
    { label: 'Author', value: 'creatorLiteral', linkable: true },
    { label: 'Publication', value: 'publicationStatement' },
    { label: 'Electronic Resource', value: 'React Component' },
    { label: 'Supplementary Content', value: 'supplementaryContent', selfLinkable: true },
  ];

  const detailsFields = [
    { label: 'Additional Authors', value: 'contributorLiteral', linkable: true },
    { label: 'Found In', value: 'partOf' },
    { label: 'Publication Date', value: 'serialPublicationDates' },
    { label: 'Description', value: 'extent' },
    { label: 'Donor/Sponsor', value: 'donor' },
    { label: 'Series Statement', value: 'seriesStatement' },
    { label: 'Uniform Title', value: 'uniformTitle' },
    { label: 'Alternative Title', value: 'titleAlt' },
    { label: 'Former Title', value: 'formerTitle' },
    { label: 'Subject', value: 'subjectHeadingData' },
    { label: 'Genre/Form', value: 'genreForm' },
    { label: 'Notes', value: 'React Component' },
    { label: 'Contents', value: 'tableOfContents' },
    { label: 'Bibliography', value: '' },
    { label: 'Call Number', value: 'identifier', identifier: 'bf:ShelfMark' },
    { label: 'ISBN', value: 'identifier', identifier: 'bf:Isbn' },
    { label: 'ISSN', value: 'identifier', identifier: 'bf:Issn' },
    { label: 'LCCN', value: 'identifier', identifier: 'bf:Lccn' },
    { label: 'OCLC', value: 'identifier', identifier: 'nypl:Oclc' },
    { label: 'GPO', value: '' },
    { label: 'Other Titles', value: '' },
    { label: 'Owning Institutions', value: '' },
  ];

  // if the subject heading API call failed for some reason,
  // we will use the subjectLiteral property from the
  // Discovery API response instead
  if (!bib.subjectHeadingData) {
    detailsFields.push({
      label: 'Subject', value: 'subjectLiteral', linkable: true,
    });
  }

  const itemsContainer = items.length && !isElectronicResources ? (
    <ItemsContainer
      key={bibId}
      shortenItems={shortenItems}
      items={items}
      bibId={bibId}
      itemPage={itemPage}
      searchKeywords={searchKeywords}
      holdings={bib.holdings}
    />
  ) : null;

  const isNYPL = isNyplBnumber(bib.uri);

  const details = (
    <React.Fragment>
      <Heading
        level={3}
      >
        Details
      </Heading>
      <BibDetails
        bib={bib}
        fields={detailsFields}
        electronicResources={aggregatedElectronicResources}
        additionalData={isNYPL && bib.annotatedMarc ? annotatedMarcDetails(bib) : []}
      />
    </React.Fragment>
  );

  const contentAreas = [
    itemsContainer ? {
      title: 'Availability',
      content: itemsContainer,
    } : null,
    bib.holdings ? {
      title: 'Library Holdings',
      content: <LibraryHoldings holdings={bib.holdings} />,
    } : null,
    {
      title: 'Details',
      content: details,
    },
  ].filter(area => area)
    .map(area => <React.Fragment><br /> { area.content }</React.Fragment>);

  const classicLink = (
    bibId.startsWith('b') ?
      <a href={`${appConfig.legacyBaseUrl}/record=${bibId}~S1`} id="legacy-catalog-link">View in Legacy Catalog</a>
      :
      null
  );

  const title = bib.title && bib.title.length ? bib.title[0] : ' ';

  return (
    <SccContainer
      useLoadingLayer
      className="nypl-item-details"
      pageTitle="Item Details"
    >
      <div
        className="nypl-item-details__heading"
      >
        <Heading
          level={2}
        >
          {title}
        </Heading>
        {resultSelection.fromUrl && resultSelection.bibId === bibId && (
          <DSLink>
            <Link
              to={resultSelection.fromUrl}
            >
              Back to search results
            </Link>
          </DSLink>
        )}
      </div>
      <BibDetails
        bib={bib}
        fields={topFields}
        logging
        electronicResources={aggregatedElectronicResources}
      />
      {
        contentAreas
      }
      {classicLink}
    </SccContainer>
  );
};

BibPage.propTypes = {
  searchKeywords: PropTypes.string,
  location: PropTypes.object,
  bib: PropTypes.object,
  dispatch: PropTypes.func,
  resultSelection: PropTypes.object,
};

BibPage.contextTypes = {
  router: PropTypes.object,
};

const mapStateToProps = ({
  bib,
  searchKeywords,
  field,
  selectedFilters,
  page,
  sortBy,
  resultSelection,
}) => ({
  bib,
  searchKeywords,
  field,
  selectedFilters,
  page,
  sortBy,
  resultSelection,
});

export default withRouter(connect(mapStateToProps)(BibPage));
