/* eslint-env mocha */
import { expect } from 'chai';
import { stub } from 'sinon';
import fs from 'fs';

import NyplApiClient from '@nypl/nypl-data-api-client';

import Bib, { addCheckInItems } from './../../src/server/ApiRoutes/Bib';

describe('Bib', () => {
  /* holding could lack location, as shown in second holding */
  const mockBib = {
    extent: ['99 bottles of beer'],
    dimensions: ['99 x 99 cm'],
    holdings: [
      {
        location: [{
          label: 'Mid-Manhattan',
          code: 'mm',
        }],
        format: 'Text',
        checkInBoxes: [
          {
            position: 1,
            status: 'available',
            coverage: '1000',
            shelfMark: 'abcd',
          },
          {
            position: 3,
            status: 'available',
            coverage: '1001',
            shelfMark: 'efgh',
          },
        ],
      },
      {
        format: 'AV',
        checkInBoxes: [
          {
            position: 2,
            status: 'available',
            coverage: '1002',
            shelfMark: 'ijkl',
          },
          {
            position: 4,
            status: 'Expected',
            coverage: '1003',
            shelfMark: 'mnop',
          },
        ],
      },
    ],
  };

  describe('appendDimensionsToExtent', () => {
    it('should add a semicolon after extent if there is not one already', () => {
      const [newExtent] = Bib.appendDimensionsToExtent(mockBib);
      expect(newExtent).to.include('; ');
    });
    it('should append dimensions to extent', () => {
      const [newExtent] = Bib.appendDimensionsToExtent(mockBib);
      expect(newExtent).to.equal('99 bottles of beer; 99 x 99 cm');
    });
    it('should not add semicolon if it already is in extent', () => {
      const [newExtent] = Bib.appendDimensionsToExtent({
        extent: ['700 sheets of woven gold; '],
        dimensions: ['1 x 1 in.'],
      });
      expect(newExtent).to.equal('700 sheets of woven gold; 1 x 1 in.');
    });
    it('should remove semicolon if there is no dimensions', () => {
      const [newExtent] = Bib.appendDimensionsToExtent({
        extent: ['700 sheets of woven gold; '],
      });
      const [anotherExtent] = Bib.appendDimensionsToExtent({
        extent: ['700 sheets of woven gold;'],
      });
      expect(newExtent).to.equal('700 sheets of woven gold');
      expect(anotherExtent).to.equal('700 sheets of woven gold');
    });
    it('should return undefined if there is no extent', () => {
      const nullExtent = Bib.appendDimensionsToExtent({});
      expect(nullExtent).to.equal(undefined);
    });
  });

  describe('addCheckInItems', () => {
    it('should add correctly structured checkInItems', () => {
      addCheckInItems(mockBib);
      expect(mockBib.checkInItems).to.deep.equal([
        {
          accessMessage: {
            '@id': 'accessMessage: 1',
            prefLabel: 'Use in library',
          },
          available: true,
          callNumber: 'efgh',
          format: 'Text',
          holdingLocationCode: 'mm',
          isSerial: true,
          location: 'Mid-Manhattan',
          locationUrl: undefined,
          position: 3,
          requestable: false,
          status: {
            prefLabel: 'available',
          },
          volume: '1001',
        },
        {
          accessMessage: {
            '@id': 'accessMessage: 1',
            prefLabel: 'Use in library',
          },
          available: true,
          callNumber: 'ijkl',
          format: 'AV',
          isSerial: true,
          location: '',
          locationUrl: undefined,
          holdingLocationCode: '',
          position: 2,
          requestable: false,
          status: {
            prefLabel: 'available',
          },
          volume: '1002',
        },
        {
          accessMessage: {
            '@id': 'accessMessage: 1',
            prefLabel: 'Use in library',
          },
          available: true,
          callNumber: 'abcd',
          format: 'Text',
          holdingLocationCode: 'mm',
          isSerial: true,
          location: 'Mid-Manhattan',
          locationUrl: undefined,
          position: 1,
          requestable: false,
          status: {
            prefLabel: 'available',
          },
          volume: '1000',
        },
      ]);
    });
  });
  describe('addLocationUrls', () => {
    before(() => {
      stub(NyplApiClient.prototype, 'get').callsFake(() => Promise.resolve(
        JSON.parse(
          fs.readFileSync(
            './test/fixtures/locations-service-mm.json', 'utf8'))));
    });
    after(() => {
      NyplApiClient.prototype.get.restore();
    });
    it('should add location URLs', () => {
      Bib.addLocationUrls(mockBib).then((resp) => {
        expect(resp.holdings).to.deep.equal([
          {
            location: [{
              label: 'Mid-Manhattan',
              code: 'mm',
              url: 'http://www.nypl.org/locations/mid-manhattan-library',
            }],
            format: 'Text',
            checkInBoxes: [
              {
                position: 1,
                status: 'available',
                coverage: '1000',
                shelfMark: 'abcd',
              },
              {
                position: 3,
                status: 'available',
                coverage: '1001',
                shelfMark: 'efgh',
              },
            ],
          },
          {
            format: 'AV',
            checkInBoxes: [
              {
                position: 2,
                status: 'available',
                coverage: '1002',
                shelfMark: 'ijkl',
              },
              {
                position: 4,
                status: 'Expected',
                coverage: '1003',
                shelfMark: 'mnop',
              },
            ],
          },
        ]);
      });
    });
  });
});
