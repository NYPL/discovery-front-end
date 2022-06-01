/* eslint-env mocha */
import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import WrappedDataLoader, { DataLoader } from './../../src/app/components/DataLoader/DataLoader';
import dataLoaderUtil from '@dataLoaderUtil';

describe('DataLoader', () => {
  let dataLoaderUtilSpy;
  const location = { pathname: '', search: '' };
  let wrapper;
  before(() => {
    const children = (<div />);
    dataLoaderUtilSpy = sinon.spy(dataLoaderUtil, 'loadDataForRoutes');
    wrapper = shallow(<DataLoader lastLoaded="/pathname" location={location} children={children} dispatch={() => {}}/>);
  });
  after(() => {
    dataLoaderUtilSpy.restore();
  });
  it('should call dataLoaderUtil with location', () => {
    expect(dataLoaderUtilSpy.calledWith(location)).to.equal(true);
  });
  it('should render the children', () => {
    expect(wrapper.find('div')).to.have.lengthOf(1);
  });
});
