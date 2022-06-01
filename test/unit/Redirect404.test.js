/* eslint-env mocha */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';

import Redirect404 from '../../src/app/components/Redirect404/Redirect404';
import appConfig from '@appConfig';

const {
  circulatingCatalog,
  legacyBaseUrl,
  displayTitle,
  baseUrl,
} = appConfig;


describe('Redirect404', () => {
  const component = mount(
    <Redirect404 />,
    {
      context: {
        router: {
          location: {
            query: {
              originalUrl: 'https://catalog.nypl.org/missing',
            },
          },
        },
      },
    },
  );

  it('should have an h1', () => {
    expect(component.find('h1').length).to.equal(1);
    expect(component.find('h1').text()).to.equal('We\'re Sorry...');
  });

  it('should have a p', () => {
    expect(component.find('p').length).to.equal(1);
    expect(component.find('p').text()).to.include("You've followed an out-of-date link to our research catalog.");
  });

  it('should have the original url', () => {
    expect(component.find('p').text()).to.include('URL: https://catalog.nypl.org/missing');
  });

  it('should have a  link to this catalog', () => {
    expect(component.find('a').length).to.equal(3);
    expect(component.find('a').at(0).prop('href')).to.equal(baseUrl);
    expect(component.find('a').at(0).text()).to.equal(displayTitle);
  });

  it('should have a link to the circulating catalog', () => {
    expect(component.find('a').at(1).prop('href')).to.equal(circulatingCatalog);
    expect(component.find('a').at(1).text()).to.equal('Circulating Catalog');
  });

  it('should have a link to the Legacy Catalog', () => {
    expect(component.find('a').at(2).prop('href')).to.equal(legacyBaseUrl);
    expect(component.find('a').at(2).text()).to.equal('Legacy Catalog');
  });
});
