import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';

import Hits from '../Hits/Hits.jsx';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';
import FacetSidebar from '../FacetSidebar/FacetSidebar.jsx';
import ResultList from '../Results/ResultsList';
import Search from '../Search/Search.jsx';
import Sorter from '../Sorter/Sorter';
import Pagination from '../Pagination/Pagination';

import { basicQuery } from '../../utils/utils.js';

const SearchResultsPage = (props) => {
  const {
    searchResults,
    searchKeywords,
    facets,
    selectedFacets,
    page,
    location,
    sortBy,
    field,
    spinning,
    error,
  } = props;

  const facetList = facets && facets.itemListElement ? facets.itemListElement : [];
  const totalHits = searchResults ? searchResults.totalResults : undefined;
  const totalPages = totalHits ? Math.floor(totalHits / 50) + 1 : 0;
  const results = searchResults ? searchResults.itemListElement : [];
  const breadcrumbs = (
    <Breadcrumbs query={searchKeywords} type="search" />
  );
  const createAPIQuery = basicQuery(props);
  const h1searchKeywordsLabel = searchKeywords ? `for ${searchKeywords}` : '';
  const h1pageLabel = totalPages ? `page ${page} of ${totalPages}` : '';
  const h1Label = `Search results ${h1searchKeywordsLabel} ${h1pageLabel}`;

  return (
    <DocumentTitle title={`${searchKeywords ? searchKeywords + ' | ' : ''} Search Results | Research Catalog | NYPL`}>
      <main className="main-page">
        <div className="nypl-page-header">
          <div className="nypl-full-width-wrapper">
            {breadcrumbs}
            <h1 aria-label={h1Label}>
              Search results
            </h1>
          </div>
        </div>
        <div className="nypl-full-width-wrapper">
          <div className="nypl-row">
            <div className="nypl-column-three-quarters nypl-column-offset-one">
              <Search
                searchKeywords={searchKeywords}
                field={field}
                spinning={spinning}
                createAPIQuery={createAPIQuery}
              />
            </div>
          </div>

          <div className="nypl-row">

            <FacetSidebar
              facets={facetList}
              spinning={spinning}
              selectedFacets={selectedFacets}
              searchKeywords={searchKeywords}
              className="nypl-column-one-quarter"
              totalHits={totalHits}
              createAPIQuery={createAPIQuery}
            />

            <div
              className="nypl-column-three-quarters"
              role="region"
              id="mainContent"
              aria-live="polite"
              aria-atomic="true"
              aria-relevant="additions removals"
              aria-describedby="results-description"
            >
              <Hits
                hits={totalHits}
                spinning={spinning}
                searchKeywords={searchKeywords}
                selectedFacets={selectedFacets}
                createAPIQuery={createAPIQuery}
                error={error}
              />

              {
                !!(totalHits && totalHits !== 0) && (
                  <Sorter
                    sortBy={sortBy}
                    page={page}
                    createAPIQuery={createAPIQuery}
                  />
                )
              }

              {
                !!(results && results.length !== 0) &&
                (<ResultList results={results}  spinning={spinning} />)
              }

              {
                !!(totalHits && totalHits !== 0) &&
                  (<Pagination
                    hits={totalHits}
                    page={page}
                    urlSearchString={location.search}
                    createAPIQuery={createAPIQuery}
                  />)
              }
            </div>
          </div>
        </div>
      </main>
    </DocumentTitle>
  );
};

SearchResultsPage.propTypes = {
  searchResults: PropTypes.object,
  searchKeywords: PropTypes.string,
  facets: PropTypes.object,
  selectedFacets: PropTypes.object,
  page: PropTypes.string,
  location: PropTypes.object,
  sortBy: PropTypes.string,
  field: PropTypes.string,
  spinning: PropTypes.bool,
  error: PropTypes.object,
};

export default SearchResultsPage;
