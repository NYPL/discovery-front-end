/* eslint-env mocha */
import MockAdapter from 'axios-mock-adapter';
import { expect } from 'chai';
import axios from 'axios';
import sinon from 'sinon';
import { useQueries } from 'history';
import sampleBib from '../fixtures/electronicAndPhysicalItemsBib';
import { ADOBE_ANALYTICS_PAGE_NAMES, ADOBE_ANALYTICS_RC_PREFIX } from '../../src/app/data/constants';

import {
  ajaxCall,
  getDefaultFilters,
  destructureFilters,
  getSortQuery,
  getIdentifierQuery,
  getFilterParam,
  getFieldParam,
  getElectronicResources,
  basicQuery,
  getReqParams,
  getAggregatedElectronicResources,
  truncateStringOnWhitespace,
  hasValidFilters,
  extractNoticePreference,
  displayContext,
  camelToShishKabobCase,
  institutionNameByNyplSource,
  isNyplBnumber,
  hasCheckDigit,
  removeCheckDigit,
  adobeAnalyticsRouteToPageName,
  standardizeBibId,
} from '../../src/app/utils/utils';

/**
 * ajaxCall()
 */
describe('ajaxCall', () => {
  describe('No input', () => {
    it('should return null if no endpoint is passed', () => {
      expect(ajaxCall()).to.equal(null);
    });
  });

  describe('Good call', () => {
    let mock;

    before(() => {
      mock = new MockAdapter(axios);
      mock
        .onGet('/api?q=locofocos')
        .reply(200, { searchResults: [] });
    });

    after(() => {
      mock.restore();
    });

    it('should call the "get" function from axios with an endpoint', () => {
      const ajaxCallGetSpy = sinon.spy(axios, 'get');
      ajaxCall('/api?q=locofocos');

      expect(ajaxCallGetSpy.callCount).to.equal(1);

      ajaxCallGetSpy.restore();
    });

    it('should invoke the callback function', (done) => {
      const cbSpy = sinon.spy();
      ajaxCall('/api?q=locofocos', cbSpy);

      setTimeout(() => {
        expect(cbSpy.callCount).to.equal(1);
        done();
      }, 0);
    });
  });

  describe('Bad call', () => {
    let mock;

    before(() => {
      mock = new MockAdapter(axios);
      mock
        .onGet('/api?q=locofocos')
        .reply(400, { searchResults: [] });
    });

    after(() => {
      mock.restore();
      console.error.restore()
    });

    it('should invoke the default error callback function', (done) => {
      const consoleError = sinon.stub(console, 'error')
      const cbSpy = sinon.spy();
      ajaxCall('/api?q=locofocos', cbSpy, consoleError);

      setTimeout(() => {
        expect(cbSpy.callCount).to.equal(0);
        done();
        expect(consoleError.callCount).to.equal(1);
      }, 0);
    });

    it('should invoke the error callback function', () => {
      const cbSpy = sinon.spy();
      const cbErrorSpy = sinon.spy();
      ajaxCall('/api?q=locofocos', (cbSpy), cbErrorSpy)
        .then(() => {
          expect(cbSpy.callCount).to.equal(0);
          expect(cbErrorSpy.callCount).to.equal(1);
        });
    });
  });
});

/**
 * getDefaultFilters
 */
describe('getDefaultFilters', () => {
  it('should return an object with a list of filters', () => {
    const defaultFilters = getDefaultFilters();

    expect(defaultFilters).to.eql({
      materialType: [],
      language: [],
      dateAfter: '',
      dateBefore: '',
      subjectLiteral: [],
      creatorLiteral: [],
      contributorLiteral: [],
    });
  });
});

describe('standardizeBib', () => {
  it('doesn\'t mess with kosher id', () => {
    expect(standardizeBibId('b12345678')).to.equal('b12345678')
    expect(standardizeBibId('hb123456789123456789')).to.equal('hb123456789123456789')
  })
  it('removes check digit', () => {
    expect(standardizeBibId('b12345678x')).to.equal('b12345678')
    expect(standardizeBibId('b12345678X')).to.equal('b12345678')
    expect(standardizeBibId('b123456781')).to.equal('b12345678')
  })
  it('lower cases everything', () => {
    expect(standardizeBibId('B12345678')).to.equal('b12345678')
    expect(standardizeBibId('CB1234567')).to.equal('cb1234567')
    expect(standardizeBibId('Hb123456789123456789')).to.equal('hb123456789123456789')
    expect(standardizeBibId('PB1234567')).to.equal('pb1234567')
    expect(standardizeBibId('PB1234567812345678')).to.equal('pb1234567812345678')
  })
  it('returns value provided if input does not match bib id regexes', () => {
    expect(standardizeBibId('b1234567899')).to.equal('b1234567899')
    expect(standardizeBibId('i am not a bib id hb123')).to.equal('i am not a bib id hb123')
  })
})
/**
 * destructureFilters
 */
describe('destructureFilters', () => {

  const apiFilters = {
    '@context':
      'http://discovery-api-qa.us-east-1.elasticbeanstalk.com/api/v0.1/discovery/context_all.jsonld',
    '@type': 'itemList',
    itemListElement:
      [
        {
          '@type': 'nypl:Aggregation',
          '@id': 'res:subjectLiteral',
          id: 'subjectLiteral',
          field: 'subjectLiteral',
          values: [
            {
              count: 130,
              label: 'Animals -- Fiction.',
              value: 'Animals -- Fiction.',
            },
            {
              count: 89,
              label: 'Awards.',
              value: 'Awards.',
            },
          ],
        },
      ],
    totalResults: 665
  };
  describe('Default call', () => {
    it('should return an empty object', () => {
      const filters = destructureFilters();
      expect(filters).to.eql({});
    });
  });

  describe('No filters from the API', () => {
    it('should return an empty object for aggregations with no values', () => {
      const filters = { 'filters[subjectLiteral][0]': 'Animals -- Fiction.', 'filters[subjectLiteral][1]': 'Awards.' };
      expect(destructureFilters(filters, {})).to.eql({});
    });
  });

  describe('Date filters', () => {
    const filters = { 'filters[dateBefore]': '2000', 'filters[dateAfter]': '1900' };
    const expectedReturnValue = { dateBefore: '2000', dateAfter: '1900' };
    it('should return object with dateBefore and dateAfter when they are passed', () => {
      expect(destructureFilters(filters, apiFilters)).to.eql(expectedReturnValue);
    });
  });

  describe('Filters with value of type array', () => {
    const filters = { 'filters[subjectLiteral][0]': ['Animals -- Fiction.', 'Awards.'] };
    const expectedReturnValue = {
      subjectLiteral: [
        { value: 'Animals -- Fiction.', label: 'Animals -- Fiction.' },
        { value: 'Awards.', label: 'Awards.' },
      ],
    };
    it('should return value/label pairs in an array under the appropriate key', () => {
      expect(destructureFilters(filters, apiFilters)).to.eql(expectedReturnValue);
    });
  });

  describe('Filters with value of type string', () => {
    const filters = { 'filters[subjectLiteral][0]': 'Animals -- Fiction.', 'filters[subjectLiteral][1]': 'Awards.' };
    const expectedReturnValue = {
      subjectLiteral: [
        { value: 'Animals -- Fiction.', label: 'Animals -- Fiction.' },
        { value: 'Awards.', label: 'Awards.' },
      ],
    };
    it('should return value/label pairs in an array under the appropriate key', () => {
      expect(destructureFilters(filters, apiFilters)).to.eql(expectedReturnValue);
    });
  });
});

/**
 * getSortQuery()
 */
describe('getSortQuery', () => {
  describe('No input', () => {
    it('should return an empty string', () => {
      expect(getSortQuery()).to.equal('');
    });
  });

  describe('Sort by Relevance', () => {
    it('should return an empty string if sorting by "revelance"', () => {
      const sortBy = 'relevance';
      expect(getSortQuery(sortBy)).to.equal('');
    });
  });

  describe('Return URL query params', () => {
    it('should sort by title asc', () => {
      const sortBy = 'title_asc';
      expect(getSortQuery(sortBy)).to.equal('&sort=title&sort_direction=asc');
    });

    it('should sort by title desc', () => {
      const sortBy = 'title_desc';
      expect(getSortQuery(sortBy)).to.equal('&sort=title&sort_direction=desc');
    });

    it('should sort by date asc', () => {
      const sortBy = 'date_asc';
      expect(getSortQuery(sortBy)).to.equal('&sort=date&sort_direction=asc');
    });

    it('should sort by date desc', () => {
      const sortBy = 'date_desc';
      expect(getSortQuery(sortBy)).to.equal('&sort=date&sort_direction=desc');
    });
  });
});

/**
 * getFilterParam()
 */
describe('getFilterParam', () => {
  describe('No input', () => {
    it('should return an empty string', () => {
      expect(getFilterParam()).to.equal('');
    });

    it('should return an empty string with no selected filters', () => {
      const filters = {
        date: { value: '', label: '' },
        issuance: { value: '', label: '' },
        language: { value: '', label: '' },
        location: { value: '', label: '' },
        materialType: { value: '', label: '' },
        mediaType: { value: '', label: '' },
        owner: { value: '', label: '' },
        publisher: { value: '', label: '' },
        subject: { value: '', label: '' },
      };
      expect(getFilterParam(filters)).to.equal('');
    });
  });

  describe('Only filters object input', () => {
    it('should return a key:value string from two filters', () => {
      const filters = {
        date: { value: '', label: '' },
        issuance: { value: '', label: '' },
        language: { value: '', label: '' },
        location: { value: '', label: '' },
        materialType: { value: 'resourcetypes:aud', label: 'Audio' },
        mediaType: { value: '', label: '' },
        owner: { value: 'orgs:1000', label: 'Stephen A. Schwarzman Building' },
        publisher: { value: '', label: '' },
        subject: { value: '', label: '' },
      };
      expect(getFilterParam(filters))
        .to.equal('&filters[materialType]=resourcetypes%3Aaud&filters[owner]=orgs%3A1000');
    });

    it('should return a key:value string from three filters', () => {
      const filters = {
        date: { value: '', label: '' },
        issuance: { value: '', label: '' },
        language: { value: 'lang:ger', label: 'German' },
        location: { value: '', label: '' },
        materialType: { value: '', label: '' },
        mediaType: { value: '', label: '' },
        owner: { value: '', label: '' },
        publisher: { value: '[Berlin] : Walter de Gruyter', label: '[Berlin] : Walter de Gruyter' },
        subject: { value: 'Electronic journals.', label: 'Electronic journals.' },
      };
      expect(getFilterParam(filters))
        .to.equal('&filters[language]=lang%3Ager&filters[publisher]=%5BBerlin%5D%20%3A%20Walter' +
          '%20de%20Gruyter&filters[subject]=Electronic%20journals.');
    });

    it('should return a key:value string from date filters and a language filter', () => {
      const filters = {
        language: { value: 'lang:ger', label: 'German' },
        materialType: { value: '', label: '' },
        dateAfter: '1999',
        dateBefore: '2010',
      };
      expect(getFilterParam(filters))
        .to.equal('&filters[language]=lang%3Ager&filters[dateAfter]=1999&filters[dateBefore]=2010');
    });
  });
});

/**
 * getFieldParam()
 */
describe('getFieldParam', () => {
  describe('No input', () => {
    it('should return an empty string', () => {
      expect(getFieldParam()).to.equal('');
    });
  });

  describe('Different values', () => {
    it('should return an empty string when "all" is selected', () => {
      expect(getFieldParam('all')).to.equal('');
    });

    it('should return a url query when "title" is selected', () => {
      expect(getFieldParam('title')).to.equal('&search_scope=title');
    });

    it('should return a url query when "author" is selected', () => {
      expect(getFieldParam('author')).to.equal('&search_scope=author');
    });
  });
});

/**
 * basicQuery()
 */
describe('basicQuery', () => {
  // This is the default values for the API endpoint call. Since this is the foundation, these
  // values won't change the default query.
  const defaultQueryObj = {
    sortBy: 'relevance',
    field: 'all',
    selectedFilters: {},
    searchKeywords: '',
    page: '1',
  };
  const defaultQueryObjwithData = {
    sortBy: 'title_desc',
    field: 'all',
    selectedFilters: {},
    searchKeywords: 'shakespeare',
    page: '4',
  };

  describe('Default call', () => {
    it('should return a function', () => {
      expect(basicQuery()).to.be.a('function');
    });

    it('should take an object as input and still return a function', () => {
      expect(basicQuery(defaultQueryObj)).to.be.a('function');
    });

    it('should return an empty string when the input is an empty object', () => {
      const createAPIQuery = basicQuery({});

      expect(createAPIQuery({})).to.equal('');
    });

    it('should return an empty string with the default object', () => {
      const createAPIQuery = basicQuery(defaultQueryObj);
      expect(createAPIQuery({})).to.equal('');
    });
  });

  // The initial data passed is not the expected default.
  describe('Default call with updated initial data', () => {
    it('should return updated default query string', () => {
      const createAPIQuery = basicQuery(defaultQueryObjwithData);

      expect(createAPIQuery({})).to.equal('q=shakespeare&sort=title&sort_direction=desc&page=4');
    });

    it('should return updated string if any new data was passed', () => {
      const createAPIQuery = basicQuery(defaultQueryObjwithData);

      expect(createAPIQuery({ page: 7, searchKeywords: 'king lear' }))
        .to.equal('q=king%20lear&sort=title&sort_direction=desc&page=7');
    });
  });

  describe('With updated data input', () => {
    const createAPIQuery = basicQuery(defaultQueryObj);

    it('should update the sort by query', () => {
      // There are more tests in the `getSortQuery` suite.
      expect(createAPIQuery({ sortBy: 'title_asc' })).to.equal('q=&sort=title&sort_direction=asc');
      expect(createAPIQuery({ sortBy: 'date_asc' })).to.equal('q=&sort=date&sort_direction=asc');
    });

    it('should update the field query', () => {
      // There are more tests in the `getFieldParam` suite.
      expect(createAPIQuery({ field: 'title' })).to.equal('q=&search_scope=title');
      expect(createAPIQuery({ field: 'author' })).to.equal('q=&search_scope=author');
    });

    it('should update the selected filters query', () => {
      // There are more tests in the `getFilterParam` suite.
      expect(createAPIQuery({
        selectedFilters: {
          language: { value: '', label: '' },
          materialType: { value: 'resourcetypes:aud', label: 'Audio' },
          owner: { value: 'orgs:1000', label: 'Stephen A. Schwarzman Building' },
          subject: { value: '', label: '' },
        },
      })).to.equal('q=&filters[materialType]=resourcetypes%3Aaud&filters[owner]=orgs%3A1000');
    });

    it('should update the searchKeywords query', () => {
      expect(createAPIQuery({ searchKeywords: 'locofocos' })).to.equal('q=locofocos');
    });

    it('should update the page query', () => {
      expect(createAPIQuery({ page: '3' })).to.equal('q=&page=3');
    });

    it('should update the string if there are multiple selections', () => {
      expect(createAPIQuery({
        field: 'title',
        searchKeywords: 'hamlet',
        sortBy: 'title_asc',
        page: '5',
      })).to.equal('q=hamlet&sort=title&sort_direction=asc&search_scope=title&page=5');
    });

    it('should update the identifier number query', () => {
      expect(createAPIQuery({
        identifierNumbers: {
          issn: '1234',
          isbn: '2345',
          oclc: '3456',
          lccn: '4567',
        },
      })).to.equal('q=&issn=1234&isbn=2345&oclc=3456&lccn=4567');
    });
  });

  describe('when given advanced search params', () => {
    const createAPIQuery = basicQuery({
      title: 'The Raven',
      subject: 'ravens',
      contributor: 'Poe',
    });

    it('should accept advanced search params in initial query', () => {
      expect(createAPIQuery({})).to.eql('q=&contributor=Poe&title=The Raven&subject=ravens');
    });

    it('should update advanced search params', () => {
      const updatedParams = {
        title: 'The Birds',
        contributor: 'Hitchcock',
        subject: 'birds',
      };
      expect(createAPIQuery(updatedParams)).to.eql('q=&contributor=Hitchcock&title=The Birds&subject=birds');
    });

    it('should clear advanced search params when explicitly told', () => {
      expect(
        createAPIQuery({ clearTitle: true, clearSubject: true, clearContributor: true }),
      ).to.eql('');
    });
  });
});

/**
 * getReqParams()
 */
describe('getReqParams', () => {
  describe('Default call', () => {
    it('should return the default object', () => {
      expect(getReqParams()).to.eql({
        contributor: undefined,
        page: '1',
        q: '',
        sort: '',
        order: '',
        sortQuery: '',
        fieldQuery: '',
        filters: {},
        perPage: '50',
        subject: undefined,
        title: undefined,
        issn: undefined,
        isbn: undefined,
        lccn: undefined,
        oclc: undefined,
        redirectOnMatch: undefined,
      });
    });
  });

  describe('With data passed from the query in the URL', () => {
    it('should return updated page', () => {
      const queryFromUrl = { page: '4' };
      expect(getReqParams(queryFromUrl)).to.eql({
        contributor: undefined,
        page: '4',
        q: '',
        sort: '',
        order: '',
        sortQuery: '',
        fieldQuery: '',
        filters: {},
        perPage: '50',
        subject: undefined,
        title: undefined,
        issn: undefined,
        isbn: undefined,
        lccn: undefined,
        oclc: undefined,
        redirectOnMatch: undefined,
      });
    });

    it('should return updated searchKeywords', () => {
      const queryFromUrl = { q: 'harry potter' };
      expect(getReqParams(queryFromUrl)).to.eql({
        contributor: undefined,
        page: '1',
        q: 'harry potter',
        sort: '',
        order: '',
        sortQuery: '',
        fieldQuery: '',
        filters: {},
        perPage: '50',
        subject: undefined,
        title: undefined,
        issn: undefined,
        isbn: undefined,
        lccn: undefined,
        oclc: undefined,
        redirectOnMatch: undefined,
      });
    });

    it('should return updated sort by', () => {
      const queryFromUrl = { sort: 'title', sort_direction: 'asc' };
      expect(getReqParams(queryFromUrl)).to.eql({
        contributor: undefined,
        page: '1',
        q: '',
        sort: 'title',
        order: 'asc',
        sortQuery: '',
        fieldQuery: '',
        filters: {},
        perPage: '50',
        subject: undefined,
        title: undefined,
        issn: undefined,
        isbn: undefined,
        lccn: undefined,
        oclc: undefined,
        redirectOnMatch: undefined,
      });
    });

    it('should return updated field', () => {
      const queryFromUrl = { search_scope: 'author' };
      expect(getReqParams(queryFromUrl)).to.eql({
        contributor: undefined,
        page: '1',
        q: '',
        sort: '',
        order: '',
        sortQuery: '',
        fieldQuery: 'author',
        filters: {},
        perPage: '50',
        subject: undefined,
        title: undefined,
        issn: undefined,
        isbn: undefined,
        lccn: undefined,
        oclc: undefined,
        redirectOnMatch: undefined,
      });
    });

    it('should return updated field', () => {
      const queryFromUrl = { sort_scope: 'title_asc' };
      expect(getReqParams(queryFromUrl)).to.eql({
        contributor: undefined,
        page: '1',
        q: '',
        sort: '',
        order: '',
        sortQuery: 'title_asc',
        fieldQuery: '',
        filters: {},
        perPage: '50',
        subject: undefined,
        title: undefined,
        issn: undefined,
        isbn: undefined,
        lccn: undefined,
        oclc: undefined,
        redirectOnMatch: undefined,
      });
    });

    it('should return updated filters', () => {
      const queryFromUrl = { filters: 'filters[owner]=orgs%3A1000' };
      expect(getReqParams(queryFromUrl)).to.eql({
        contributor: undefined,
        page: '1',
        q: '',
        sort: '',
        order: '',
        sortQuery: '',
        fieldQuery: '',
        filters: 'filters[owner]=orgs%3A1000',
        perPage: '50',
        subject: undefined,
        title: undefined,
        issn: undefined,
        isbn: undefined,
        lccn: undefined,
        oclc: undefined,
        redirectOnMatch: undefined,
      });
    });

    it('should return advanced search params', () => {
      const queryFromUrl = { title: 'The Raven', contributor: 'Edgar Allen Poe', subject: 'ravens' };
      expect(getReqParams(queryFromUrl)).to.eql({
        contributor: 'Edgar Allen Poe',
        fieldQuery: '',
        filters: {},
        order: '',
        page: '1',
        perPage: '50',
        q: '',
        sort: '',
        sortQuery: '',
        subject: 'ravens',
        title: 'The Raven',
        issn: undefined,
        isbn: undefined,
        lccn: undefined,
        oclc: undefined,
        redirectOnMatch: undefined,
      });
    });

    it('should pass identifier number related params', () => {
      const queryFromUrl = { issn: '1234-5678', isbn: '0123456789', lccn: '12345678', oclc: '234567890', redirectOnMatch: 'true' };
      expect(getReqParams(queryFromUrl)).to.eql({
        page: '1',
        q: '',
        sort: '',
        order: '',
        sortQuery: '',
        fieldQuery: '',
        filters: {},
        perPage: '50',
        issn: '1234-5678',
        isbn: '0123456789',
        lccn: '12345678',
        oclc: '234567890',
        redirectOnMatch: 'true',
        contributor: undefined,
        subject: undefined,
        title: undefined,
      });
    });
  });
});

describe('truncateStringOnWhitespace()', () => {
  it('Should return a short title as-is', () => {
    expect(truncateStringOnWhitespace('Test Title', 25)).to.equal('Test Title');
  });

  it('Should truncate a long title when break lands in the middle of a word', () => {
    const truncStr = truncateStringOnWhitespace('Longer Title Here To Become Shorter', 25);
    expect(truncStr).to.equal('Longer Title Here To...');
    expect(truncStr.length).to.be.lessThan(26);
  });

  it('Should truncate a long title when break lands on a whitespace', () => {
    const truncStr = truncateStringOnWhitespace('Longer Title Break On Whitespace', 25);
    expect(truncStr).to.equal('Longer Title Break On...');
    expect(truncStr.length).to.be.lessThan(26);
  });

  it('Should truncate single word title regardless of whitespace', () => {
    const truncStr = truncateStringOnWhitespace('ThisIsAOneWordTitleWhichCouldExistOutThere', 25);
    expect(truncStr).to.equal('ThisIsAOneWordTitleWhi...');
    expect(truncStr.length).to.be.lessThan(26);
  });
});

/**
 * hasValidFilters
 */
describe('hasValidFilters', () => {
  it('should return false for falsey filters', () => {
    expect(hasValidFilters()).to.equal(false);
    expect(hasValidFilters(undefined)).to.equal(false);
  });

  it('should return false if no filters have values', () => {
    const filters = {
      materialType: [],
      language: [],
      dateAfter: '',
      dateBefore: '',
      subjectLiteral: []
    };
    expect(hasValidFilters(filters)).to.equal(false);
  });

  it('should return true if dateAfter is any number', () => {
    expect(hasValidFilters({ dateAfter: '0' })).to.equal(true);
    expect(hasValidFilters({ dateAfter: '-1' })).to.equal(true);
    expect(hasValidFilters({ dateAfter: '20201' })).to.equal(true);
  });

  it('should return true if a materialType filter is present', () => {
    const filters = {
      materialType: [
        {
          selected: true,
          value: 'resourcetypes:aud',
          label: 'Audio',
          count: 400314
        }
      ]
    };
    expect(hasValidFilters(filters)).to.equal(true);
  });
});

describe('extractNoticePreference', () => {
  it('should return "None" if fixedFields is empty', () => {
    expect(extractNoticePreference()).to.equal('None');
  });
  it('should return "None" if fixedFields does not have a "268" field', () => {
    expect(extractNoticePreference({ '123': 'nonsense' })).to.equal('None');
  });
  it('should return "Email" if "268" field value is "z"', () => {
    expect(extractNoticePreference({ '268': { 'value': 'z' } })).to.equal('Email');
  });
  it('should return "Telephone" if "268" field value is "p"', () => {
    expect(extractNoticePreference({ '268': { 'value': 'p' } })).to.equal('Telephone');
  });
  it('should return "None" if "268" field value is "-"', () => {
    expect(extractNoticePreference({ '268': { 'value': '-' } })).to.equal('None');
  });
});

describe('displayContext', () => {
  it('should include searchKeywords', () => {
    expect(displayContext({ searchKeywords: 'birds' })).to.eql('for keyword "birds"');
  });

  it('should map contributor to Author', () => {
    expect(displayContext({ contributor: 'Poe' })).to.eql('for Author: Poe');
  });

  it('should map title to Title', () => {
    expect(displayContext({ title: 'The Raven' })).to.eql('for Title: The Raven');
  });

  it('should map subject to Subject', () => {
    expect(displayContext({ subject: 'ravens' })).to.eql('for Subject: ravens');
  });

  it('should combine terms', () => {
    expect(displayContext({
      subject: 'ravens',
      contributor: 'Poe',
      title: 'The Raven',
      searchKeywords: 'birds',
    })).to.eql('for keyword "birds" and Author: Poe and Title: The Raven and Subject: ravens');
  });
});

describe('camelToShishKabobCase', () => {
  it('should convert camel to shish kabob case', () => {
    expect(camelToShishKabobCase('SierraNypl')).to.eq('sierra-nypl');
    expect(camelToShishKabobCase('RecapPul')).to.eq('recap-pul');
    expect(camelToShishKabobCase('firstCharCanBeLowerCase')).to.eq('first-char-can-be-lower-case');
  });
});

describe('institutionNameByNyplSource', () => {
  it('should resolve all institution names', () => {
    expect(institutionNameByNyplSource('sierra-nypl')).to.eq('NYPL');
    expect(institutionNameByNyplSource('recap-pul')).to.eq('Princeton');
    expect(institutionNameByNyplSource('recap-cul')).to.eq('Columbia');
    expect(institutionNameByNyplSource('recap-hl')).to.eq('Harvard');
  });
});

describe('isNyplBnumber', () => {
  it('should classify NYPL bnumbers as belonging to NYPL', () => {
    expect(isNyplBnumber('b1234')).to.eq(true);
  });
  it('should classify partner bnumbers as not belonging to NYPL', () => {
    expect(isNyplBnumber('pb1234')).to.eq(false);
    expect(isNyplBnumber('hb1234')).to.eq(false);
    expect(isNyplBnumber('cb1234')).to.eq(false);
  });
});

describe('hasCheckDigit', () => {
  it('determine if bib id is NYPL bnumber and is 10 characters long', () => {
    expect(hasCheckDigit('b123456789')).to.eq(true);
    expect(hasCheckDigit('b12345678')).to.eq(false);
    expect(hasCheckDigit('b1234567891')).to.eq(false);
    expect(hasCheckDigit('cb12345678')).to.eq(false);
  });
});

describe('removeCheckDigit', () => {
  it('should remove check digit from bnumber when present', () => {
    expect(removeCheckDigit('b123456789')).to.eq('b12345678');
  });
  it('should return original bnumber when check digit is absent', () => {
    expect(removeCheckDigit('b12345678')).to.eq('b12345678');
    expect(removeCheckDigit('b1234567891')).to.eq('b1234567891');
  });
});

describe('getIdentifierQuery', () => {
  it('should combine key-value pairs into a query', () => {
    expect(getIdentifierQuery({
      issn: '1234',
      isbn: '23456',
      oclc: '34567',
      lccn: '45678',
    })).to.equal('&issn=1234&isbn=23456&oclc=34567&lccn=45678');
  });
});

describe('adobeAnalyticsRouteToPageName', () => {
  it('should return the appropriate page name for a given route', () => {
    expect(adobeAnalyticsRouteToPageName('/')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.HOME}`);
    expect(adobeAnalyticsRouteToPageName('')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.HOME}`);
    expect(adobeAnalyticsRouteToPageName('/search')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.SEARCH_RESULTS}`);
    expect(adobeAnalyticsRouteToPageName('/search', '?q=test')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.SEARCH_RESULTS}|?q=test`);
    expect(adobeAnalyticsRouteToPageName('/search/advanced')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.ADVANCED_SEARCH}`);
    expect(adobeAnalyticsRouteToPageName('/bib')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.BIB}`);
    expect(adobeAnalyticsRouteToPageName('/bib/b12345678')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.BIB}|b12345678`);
    expect(adobeAnalyticsRouteToPageName('/bib/b12345678/all')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.BIB}|b12345678|all`);
    expect(adobeAnalyticsRouteToPageName('/hold/request/b12345678')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.HOLD_REQUEST}|b12345678`);
    expect(adobeAnalyticsRouteToPageName('/hold/request/b12345678-12345')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.HOLD_REQUEST}|b12345678|12345`);
    expect(adobeAnalyticsRouteToPageName('/hold/request/b12345678/edd')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.EDD_REQUEST}|b12345678`);
    expect(adobeAnalyticsRouteToPageName('/hold/request/b12345678-12345/edd')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.EDD_REQUEST}|b12345678|12345`);
    expect(adobeAnalyticsRouteToPageName('/subject_headings/a1da66e2-5e8d-4186-8403-5d43365a631e?label=D%27Adda%20family')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.SHEP}|a1da66e2-5e8d-4186-8403-5d43365a631e?label=D%27Adda%20family`);
    expect(adobeAnalyticsRouteToPageName('/subject_headings')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.SHEP}`);
    expect(adobeAnalyticsRouteToPageName('/account')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.ACCOUNT}`);
    expect(adobeAnalyticsRouteToPageName('/account/holds')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.ACCOUNT}`);
    expect(adobeAnalyticsRouteToPageName('/accountError')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.ACCOUNT_ERROR}`);
    expect(adobeAnalyticsRouteToPageName('/404/redirect')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.REDIRECT}`);
    expect(adobeAnalyticsRouteToPageName('/404')).to.eq(`${ADOBE_ANALYTICS_RC_PREFIX}${ADOBE_ANALYTICS_PAGE_NAMES.NOT_FOUND_404}`);
  });
});