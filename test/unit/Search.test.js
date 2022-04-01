/* eslint-disable react/jsx-filename-extension */
/* eslint-env mocha */
import axios from 'axios';
import React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { expect } from 'chai';

import sinon from 'sinon';
import Search from '../../src/app/components/Search/Search';
import { basicQuery } from '../../src/app/utils/utils';
import appConfig from '../../src/app/data/appConfig';
import { mountTestRender, makeTestStore } from '../helpers/store';

describe('Search', () => {
  let mockStore;
  before(() => {
    mockStore = makeTestStore();
  });
  describe('Default render', () => {
    let component;

    before(() => {
      component = mountTestRender(<Search />, { store: mockStore }).find('Search');
    });

    it('should have default state', () => {
      expect(component.state('field')).to.equal('all');
      expect(component.state('searchKeywords')).to.equal('');
    });

    it('should render a form element', () => {
      expect(component.find('form').length).to.equal(1);
      expect(component.find('form').prop('method')).to.equal('POST');
    });

    it('should have the form action point to the endpoint with no queries', () => {
      expect(component.find('form').prop('action')).to.equal(`${appConfig.baseUrl}/search`);
    });

    it('should render a select element', () => {
      expect(component.find('select').length).to.equal(1);
      expect(component.find('select').prop('id')).to.equal('search-by-field');
    });

    it('should render four option elements', () => {
      expect(component.find('option').length).to.equal(6);
    });

    it('should have relevance as the default selected option', () => {
      expect(component.find('select').prop('value')).to.equal('all');
    });

    it('should render an input text element', () => {
      expect(component.find('input').length).to.equal(1);
      expect(component.find('input').at(0).prop('type')).to.equal('text');
    });

    it('should render a submit button', () => {
      expect(component.find('button').length).to.equal(1);
      expect(component.find('button').at(0).prop('type')).to.equal('submit');
    });
  });

  describe('Render with props', () => {
    let component;

    before(() => {
      component = mountTestRender(<Search />, {
        store: makeTestStore({
          field: 'title', searchKeywords: 'Dune',
        }),
      }).find('Search');
    });

    it('should update the initial state with the props', () => {
      expect(component.state('field')).to.equal('title');
      expect(component.state('searchKeywords')).to.equal('Dune');
    });
  });

  describe('Update the field selected', () => {
    let component;
    let createAPIQuery;
    let onFieldChangeSpy;

    before(() => {
      createAPIQuery = basicQuery({});
      onFieldChangeSpy = sinon.spy(Search.WrappedComponent.prototype, 'onFieldChange');
      component = mountTestRender(<Search createAPIQuery={createAPIQuery} />, {
        store: mockStore,
        context: { router: { createHref: () => {}, push: () => {} } },
      }).find('Search');
    });

    after(() => {
      onFieldChangeSpy.restore();
    });

    it('should update the select value and update the state', () => {
      expect(component.state('field')).to.equal('all');

      // Because Search#onFieldChange derives the selected value from the DOM
      // node by reference (rather than reading the target node referenced in
      // the event, which may have been trashed by the time we read it), we
      // need to both set the node value directly and then also simulate a
      // 'change' event to trigger the handler:
      component.find('select').getDOMNode().value = 'title';
      component.find('select').simulate('change');

      expect(onFieldChangeSpy.callCount).to.equal(1);
      expect(component.state('field')).to.equal('title');
    });
  });

  describe('Update the input entered', () => {
    let component;
    let createAPIQuery;
    let inputChangeSpy;

    before(() => {
      createAPIQuery = basicQuery({});
      inputChangeSpy = sinon.spy(Search.WrappedComponent.prototype, 'inputChange');
      component = mountTestRender(<Search createAPIQuery={createAPIQuery} />, {
        store: mockStore,
        context: { router: { createHref: () => {}, push: () => {} } },
      }).find('Search');
    });

    after(() => {
      inputChangeSpy.restore();
    });

    it('should update the input value entered and update the state', () => {
      expect(component.state('searchKeywords')).to.equal('');

      component.find('input').at(0).simulate('change', { target: { value: 'Dune' } });

      expect(inputChangeSpy.callCount).to.equal(1);
      expect(component.state('searchKeywords')).to.equal('Dune');
    });
  });

  describe('Update when submitting', () => {
    let component;
    let createAPIQuery;
    let triggerSubmitSpy;
    let submitSearchRequestSpy;
    let mock;
    let contextRoutesPushed = [];

    before(() => {
      createAPIQuery = basicQuery({});
      triggerSubmitSpy = sinon.spy(Search.WrappedComponent.prototype, 'triggerSubmit');
      submitSearchRequestSpy = sinon.spy(Search.WrappedComponent.prototype, 'submitSearchRequest');
      component = mountTestRender(
        <Search
          createAPIQuery={createAPIQuery}
          router={{ push: route => contextRoutesPushed.push(route) }}
        />,
        { store: mockStore }).find('Search');

      mock = new MockAdapter(axios);
      mock
        .onGet(new RegExp(`${appConfig.baseUrl}/api\\?q=.*`))
        .reply(200, { searchResults: [] })
        .onAny()
        .reply(500);
    });

    after(() => {
      mock.restore();
      triggerSubmitSpy.restore();
      submitSearchRequestSpy.restore();
    });

    afterEach(() => {
      contextRoutesPushed = [];
      submitSearchRequestSpy.reset();
    });

    it('should submit the input entered when clicking the submit button', (done) => {
      expect(component.state('searchKeywords')).to.equal('');

      component.find('input').at(0).simulate('change', { target: { value: 'Dune' } });
      component.find('button').at(0).simulate('click');
      setTimeout(() => {
        expect(submitSearchRequestSpy.callCount).to.equal(1);
        expect(component.state('searchKeywords')).to.equal('Dune');
        done();
      }, 1000);
    });

    it('should submit the input entered when pressing enter', () => {
      component.find('input').at(0).simulate('change', { target: { value: 'Dune' } });
      expect(component.state('searchKeywords')).to.equal('Dune');
      component.find('input').at(0).simulate('change', { target: { value: 'Harry Potter' } });
      component.find('button').at(0).simulate('submit');
      expect(component.state('searchKeywords')).to.equal('Harry Potter');
      expect(triggerSubmitSpy.callCount).to.equal(1);
    });

    it('should not update the searchKeywords before it submits the request', () => {
      component.find('input').at(0).simulate('change', { target: { value: 'Watts' } });
      component.find('button').at(0).simulate('click');
      expect(mockStore.getState().searchKeywords).not.to.equal('Watts');
    });
  });
});
