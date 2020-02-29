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
} from '../../utils/utils';
import Actions from '../../actions/Actions';
import appConfig from '../../data/appConfig';
import DataLoader from '../DataLoader/DataLoader';

class App extends React.Component {
  constructor(props) {
    console.log('App Store', Store.getState());
    super(props);
    this.state = {
      data: Store.getState(),
      patron: PatronStore.getState(),
    };
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    window.appStore = Store;
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

      if (action === 'POP' && search) {
        ajaxCall(`${appConfig.baseUrl}/api${decodeURI(search)}`, (response) => {
          const { data } = response;
          if (data.filters && data.searchResults) {
            const selectedFilters = destructureFilters(urlFilters, data.filters);
            Actions.updateSelectedFilters(selectedFilters);
            Actions.updateFilters(data.filters);
            Actions.updateSearchResults(data.searchResults);
            Actions.updatePage(query.page || '1');
            if (qParameter) Actions.updateSearchKeywords(qParameter);
          }
        });
      }
    });
  }

  componentWillUnmount() {
    Store.unlisten(this.onChange);
  }

  onChange() {
    this.setState({ data: Store.getState() });
  }

  render() {
    return (
      <DocumentTitle title="Shared Collection Catalog | NYPL">
        <div className="app-wrapper">
          <Header
            navData={navConfig.current}
            skipNav={{ target: 'mainContent' }}
            patron={this.state.patron}
            />
          <DataLoader
            key={JSON.stringify(this.context.router.location)}
            location={this.context.router.location}
            next={Store.next}
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

App.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  route: PropTypes.object,
};

App.defaultProps = {
  children: {},
  location: {},
};

App.contextTypes = {
  router: PropTypes.object,
};


export default App;
