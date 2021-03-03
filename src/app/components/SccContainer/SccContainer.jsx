import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import DocumentTitle from 'react-document-title';

import {
  Breadcrumbs,
  Heading,
  Hero,
  HeroTypes,
} from '@nypl/design-system-react-components';

import LoadingLayer from '../LoadingLayer/LoadingLayer';
import SubNav from '../SubNav/SubNav';

const SccContainer = (props) => {
  const {
    loading,
    appConfig,
  } = useSelector(state => ({
    loading: state.loading,
    appConfig: state.appConfig,
  }));
  const {
    useLoadingLayer,
    children,
    activeSection,
    className,
    pageTitle,
  } = props;

  const documentTitle = `${pageTitle ? `${pageTitle} | ` : ''}${appConfig.displayTitle} | NYPL`;

  return (
    <DocumentTitle title={documentTitle}>
      <div className="nypl-ds nypl--research layout-container">
        {
          useLoadingLayer ? (
            <LoadingLayer
              loading={loading}
            />
          ) : null
        }
        <main className="main main-page">
          <div className="content-header catalog__header">
            <Breadcrumbs
              breadcrumbs={[
                { url: 'htttps://www.nypl.org', text: 'Home' },
                { url: 'https://www.nypl.org/research', text: 'Research' },
                { url: appConfig.baseUrl, text: 'Research Catalog' },
              ]}
              className="breadcrumbs"
            />
            <div className="catalog__heading">
              <Heading
                level={1}
                id="1"
                blockName="hero"
              >
                {appConfig.displayTitle}
              </Heading>
            </div>
            <SubNav activeSection={activeSection} />
          </div>
          <div className={`content-primary ${className || ''}`}>
            {children}
          </div>
        </main>
      </div>
    </DocumentTitle>
  );
};

SccContainer.propTypes = {
  children: PropTypes.array,
  useLoadingLayer: PropTypes.bool,
  activeSection: PropTypes.string,
  className: PropTypes.string,
  pageTitle: PropTypes.string,
};

SccContainer.defaultProps = {
  useLoadingLayer: true,
};

SccContainer.contextTypes = {
  router: PropTypes.object,
};

export default SccContainer;
