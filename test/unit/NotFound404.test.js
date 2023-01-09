/* eslint-env mocha */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';

import config from '../../src/app/data/appConfig';

import NotFound404 from '../../src/app/components/NotFound404/NotFound404';

describe('NotFound404', () => {
  let component;

  before(() => {
    component = mount(<NotFound404 />);
  });

  it('should be wrapped in a .not-found-404 class', () => {
    expect(component.find('.not-found-404').length).to.equal(1);
  });

  it('should contain two `a` elements', () => {
    expect(component.find('a')).to.have.length(2);
  });

  it('should contain a link to the homepage', () => {
    expect(component.find('Link').prop('to')).to.equal(`${config.baseUrl}/`);
  });

  it('should contain a link to the old catalog', () => {
    expect(component.find('a').at(1).prop('href')).to.equal('https://legacyBaseUrl.nypl.org');
  });
});
