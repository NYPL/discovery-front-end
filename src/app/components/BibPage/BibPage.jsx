import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { every as _every } from 'underscore';
import { LeftWedgeIcon } from '@nypl/dgx-svg-icons';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import itemsContainerModule from '../Item/ItemsContainer';
import BibDetails from './BibDetails';
import LibraryItem from '../../utils/item';
import BackLink from './BackLink';
import AdditionalDetailsViewer from './AdditionalDetailsViewer';
import Tabbed from './Tabbed';
import NotFound404 from '../NotFound404/NotFound404';
import LibraryHoldings from './LibraryHoldings';
import getOwner from '../../utils/getOwner';
import appConfig from '../../data/appConfig';
// Removed MarcRecord because the webpack MarcRecord is not working. Sep/28/2017
// import MarcRecord from './MarcRecord';
import { ajaxCall } from '@utils';
import { updateBibPage, updateLoadingStatus } from '@Actions';
import { itemBatchSize } from '../../data/constants';

import {
  basicQuery,
  getAggregatedElectronicResources,
} from '../../utils/utils';

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
                itemFrom: itemFrom + itemBatchSize,
              },
            ),
        }));
      },
      (error) => { console.error(error); },
    );
  }
};

export const BibPage = (props) => {
  const {
    location,
    searchKeywords,
    features,
    field,
    selectedFilters,
    page,
    sortBy,
    dispatch,
  } = props;

  if (!props.bib || props.bib.status === '404') return (<NotFound404 />);
  const bib = props.bib ? props.bib : {};
  // check whether this is a server side or client side render
  // by whether 'window' is defined. After the first render on the client side
  // check for more items
  if (typeof window !== 'undefined') {
    checkForMoreItems(bib, dispatch);
  }
  const bibId = bib && bib['@id'] ? bib['@id'].substring(4) : '';
  const title = bib.title && bib.title.length ? bib.title[0] : '';
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

  const tabFields = [
    { label: 'Additional Authors', value: 'contributorLiteral', linkable: true },
    { label: 'Found In', value: 'partOf' },
    { label: 'Publication Date', value: 'serialPublicationDates' },
    { label: 'Description', value: 'extent' },
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
    tabFields.push({
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
  // Related to removing MarcRecord because the webpack MarcRecord is not working. Sep/28/2017
  // const marcRecord = isNYPLReCAP ? <MarcRecord bNumber={bNumber[0]} /> : null;

  const tabDetails = (
    <BibDetails
      bib={bib}
      fields={tabFields}
      electronicResources={aggregatedElectronicResources}
    />
  );

  const additionalDetails = (<AdditionalDetailsViewer bib={bib} />);

  const otherLibraries = ['Princeton University Library', 'Columbia University Libraries'];

  const tabs = [
    itemsContainer ? {
      title: 'Availability',
      content: itemsContainer,
    } : null,
    {
      title: 'Details',
      content: tabDetails,
    },
    !otherLibraries.includes(getOwner(bib)) && bib.annotatedMarc ? {
      title: 'Full Description',
      content: additionalDetails,
    } : null,
    bib.holdings ? {
      title: 'Library Holdings',
      content: <LibraryHoldings holdings={bib.holdings} />,
    } : null,
  ].filter(tab => tab);

  const classicLink = (
    bibId.startsWith('b') && features.includes('catalog-link') ?
      <a href={`${appConfig.classicCatalog}/record=${bibId}~S1`} id="legacy-catalog-link">View in Legacy Catalog</a>
      :
      null
  );

  const createAPIQuery = basicQuery({
    searchKeywords,
    field,
    selectedFilters,
    page,
    sortBy,
  });
  const searchUrl = createAPIQuery({});

  return (
    <DocumentTitle title="Item Details | Shared Collection Catalog | NYPL">
      <main className="main-page">
        <div className="nypl-page-header">
          <div className="nypl-full-width-wrapper drbb-integration">
            <div className="nypl-row">
              <Breadcrumbs type="bib" searchUrl={searchUrl} />
              <h1 id="mainContent">{title}</h1>
              {
                searchKeywords && (
                  <div className="nypl-row search-control">
                    <LeftWedgeIcon
                      preserveAspectRatio="xMidYMid meet"
                      title="Back to Results"
                    />
                    <BackLink
                      searchUrl={searchUrl}
                      searchKeywords={searchKeywords}
                    />
                  </div>
                )
              }
            </div>
          </div>
        </div>

        <div className="nypl-full-width-wrapper drbb-integration">
          <div className="nypl-row">
            <div className="nypl-item-details">
              <BibDetails
                bib={bib}
                fields={topFields}
                logging
                electronicResources={aggregatedElectronicResources}
              />
              <Tabbed
                tabs={tabs}
                hash={location.hash}
              />
              { classicLink }
            </div>
          </div>
        </div>
      </main>
    </DocumentTitle>
  );
};

BibPage.propTypes = {
  searchKeywords: PropTypes.string,
  location: PropTypes.object,
  bib: PropTypes.object,
  features: PropTypes.array,
  field: PropTypes.string,
  selectedFilters: PropTypes.object,
  page: PropTypes.string,
  sortBy: PropTypes.string,
};

BibPage.defaultProps = {
  features: [],
};

const mapStateToProps = ({
  bib,
  searchKeywords,
  features,
  field,
  selectedFilters,
  page,
  sortBy,
}) => ({
  bib,
  searchKeywords,
  features,
  field,
  selectedFilters,
  page,
  sortBy,
});

export default withRouter(connect(mapStateToProps)(BibPage));
