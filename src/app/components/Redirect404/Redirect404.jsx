import { Heading } from '@nypl/design-system-react-components';
import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';

import appConfig from '../../data/appConfig';

const Redirect404 = (props, context) => {
  const originalUrl = context &&
    context.router &&
    context.router.location &&
    context.router.location.query &&
    context.router.location.query.originalUrl;

  const {
    circulatingCatalog,
    legacyBaseUrl,
    displayTitle,
    baseUrl,
  } = appConfig;

  return (
    <DocumentTitle title={`404 | ${appConfig.displayTitle} | NYPL`}>
      <div className="redirect404 .nypl-ds">
        <div className="redirect404text">
          <Heading level={1}>
            We&apos;re Sorry...
          </Heading>
          <p>
            You&apos;ve followed an out-of-date link to our research catalog.
            <div className="originalUrlText">
              <span>{ originalUrl ? `URL: ${originalUrl}` : ''}</span>
            </div>
            {"You may be able to find what you're looking for in the "}
            <a href={baseUrl}>{displayTitle}</a>
            {' or the '}
            <a href={circulatingCatalog}>Circulating Catalog</a>{'. You can also try the '}<a href={legacyBaseUrl}>Legacy Catalog</a>.
          </p>
        </div>
      </div>
    </DocumentTitle>
  );
};


Redirect404.contextTypes = {
  router: PropTypes.object,
};

export default Redirect404;
