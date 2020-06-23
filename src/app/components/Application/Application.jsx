/* global window */
import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { pick as _pick } from 'underscore';

import { Header, navConfig } from '@nypl/dgx-header-component';
import Footer from '@nypl/dgx-react-footer';

import Feedback from '../Feedback/Feedback';
import Store from '../../stores/Store';
import PatronStore from '../../stores/PatronStore';
import {
  ajaxCall,
  destructureFilters,
  basicQuery,
} from '../../utils/utils';
import Actions from '../../actions/Actions';
import appConfig from '../../data/appConfig';
import { breakpoints } from '../../data/constants';
import DataLoader from '../DataLoader/DataLoader';

class Application extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: Store.getState(),
      patron: PatronStore.getState(),
      media: 'desktop',
    };
    this.onChange = this.onChange.bind(this);
    this.shouldStoreUpdate = this.shouldStoreUpdate.bind(this);
  }

  getChildContext() {
    return {
      media: this.state.media,
    };
  }

  componentDidMount() {
    Store.listen(this.onChange);
    // Listen to the browser's navigation buttons.
    this.props.route.history.listen((location = { action: '', search: '', query: {} }) => {
      const {
        action,
        search,
        query,
      } = location;

      const qParameter = query.q;
      const urlFilters = _pick(query, (value, key) => {
        if (key.indexOf('filter') !== -1) {
          return value;
        }
        return null;
      });

      if (action === 'POP' && search && this.shouldStoreUpdate()) {
        Actions.updateLoadingStatus(true);
        ajaxCall(`${appConfig.baseUrl}/api${decodeURI(search)}`, (response) => {
          const { data } = response;
          if (data.filters && data.searchResults) {
            Actions.updateSelectedFilters(data.filters);
            Actions.updateFilters(data.filters);
            if (data.drbbResults) Actions.updateDrbbResults(data.drbbResults);
            Actions.updateSearchResults(data.searchResults);
            Actions.updatePage(query.page || '1');
            if (qParameter) Actions.updateSearchKeywords(qParameter);
            Actions.updateLoadingStatus(false);
          }
        });
      }
    });

    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.onWindowResize();
  }

  shouldStoreUpdate() {
    const { search } = this.context.router.location;

    return `?${basicQuery({})(Store.getState())}` !== search;
  }

  componentWillUnmount() {
    Store.unlisten(this.onChange);
  }

  onWindowResize() {
    const { media } = this.state;
    const { innerWidth } = window;
    const {
      xtrasmall,
      tablet,
    } = breakpoints;

    if (innerWidth <= xtrasmall) {
      if (media !== 'mobile') this.setState({ media: 'mobile' });
    } else if (innerWidth <= tablet) {
      if (media !== 'tablet') this.setState({ media: 'tablet' });
    } else {
      if (media !== 'desktop') this.setState({ media: 'desktop' });
    }
  }

  onChange() {
    this.setState({ data: Store.getState() });
  }

  render() {
    const dataLocation = Object.assign(
      {},
      this.context.router.location,
      {
        hash: null,
        action: null,
        key: null,
      },
    );

    return (
      <DocumentTitle title="Shared Collection Catalog | NYPL">
        <div className="app-wrapper">
          <Header
            navData={navConfig.current}
            skipNav={{ target: 'mainContent' }}
            patron={this.state.patron}
          />
          <DataLoader
            key={JSON.stringify(dataLocation)}
          >
            {React.cloneElement(this.props.children, this.state.data)}
          </DataLoader>
          <Footer />
          <Feedback location={this.props.location} />
        </div>
      </DocumentTitle>
    );
  }
}

Application.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
};

Application.defaultProps = {
  children: {},
  location: {},
};

Application.contextTypes = {
  router: PropTypes.object,
};

Application.childContextTypes = {
  media: PropTypes.string,
  includeDrbb: PropTypes.bool,
};

export default Application;
