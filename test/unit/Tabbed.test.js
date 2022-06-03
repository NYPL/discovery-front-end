/* eslint-env mocha */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';

import BibDetails from './../../src/app/components/BibPage/BibDetails';
import AdditionalDetailsViewer from './../../src/app/components/BibPage/AdditionalDetailsViewer';
import Tabbed from './../../src/app/components/BibPage/Tabbed';

describe('Tabbed', () => {
  const sampleBib =
  {
  "annotatedMarc" : {
  "bib": {
    "id": "12082323",
    "nyplSource": "sierra-nypl",
    "fields": [
      {
        "label": "Abbreviated Title",
        "values": [
          {
            "content": "Abrev. title -- 210 ",
            "source": {
              "fieldTag": "u",
              "marcTag": "210",
              "ind1": "1",
              "ind2": "0",
              "content": null,
              "subfields": [
                {
                  "tag": "a",
                  "content": "Abrev. title -- 210 "
                }
              ]
            }
          }
        ]
      },
      {
        "label": "Access",
        "values": [
          {
            "content": "Access -- 506 blank,any",
            "source": {
              "fieldTag": "n",
              "marcTag": "506",
              "ind1": " ",
              "ind2": " ",
              "content": null,
              "subfields": [
                {
                  "tag": "a",
                  "content": "Access -- 506 blank,any"
                }
              ]
            }
          },
          {
            "content": "Access -- 506 0,any",
            "source": {
              "fieldTag": "n",
              "marcTag": "506",
              "ind1": "0",
              "ind2": " ",
              "content": null,
              "subfields": [
                {
                  "tag": "a",
                  "content": "Access -- 506 0,any"
                }
                ]
              }
            }
          ]
        },
        {
        "label": "Url",
        "values": [
          {
            "label": "856 40",
            "content": "http://blogs.nypl.org/rcramer/",
            "source": {
              "fieldTag": "y",
              "marcTag": "856",
              "ind1": "4",
              "ind2": "0",
              "content": null,
              "subfields": [
                {
                  "tag": "u",
                  "content": "http://blogs.nypl.org/rcramer/"
                },
                {
                  "tag": "z",
                  "content": "[redacted]"
                }
              ]
            }
          }
          ]
        }
      ]
    }
  }
};

  const bottomFields = [
    { label: 'Publication', value: 'publicationStatement' },
    { label: 'Publication Date', value: 'serialPublicationDates' },
    { label: 'Electronic Resource', value: 'React Component' },
    { label: 'Description', value: 'extent' },
    { label: 'Series Statement', value: 'seriesStatement' },
    { label: 'Uniform Title', value: 'uniformTitle' },
    { label: 'Alternative Title', value: 'titleAlt' },
    { label: 'Former Title', value: 'formerTitle' },
    { label: 'Subject', value: 'subjectLiteral', linkable: true },
    { label: 'Genre/Form', value: 'genreForm' },
    { label: 'Notes', value: 'React Component' },
    { label: 'Additional Resources', value: 'supplementaryContent', selfLinkable: true },
    { label: 'Contents', value: 'tableOfContents' },
    { label: 'Bibliography', value: '' },
    { label: 'ISBN', value: 'identifier', identifier: 'urn:isbn' },
    { label: 'ISSN', value: 'identifier', identifier: 'urn:issn' },
    { label: 'LCC', value: 'identifier', identifier: 'urn:lcc' },
    { label: 'GPO', value: '' },
    { label: 'Other Titles', value: '' },
    { label: 'Owning Institutions', value: '' },
  ];

  // importing ItemsContainer component causes a memory issue
  // mock a simple component for test
  const mockItemsContainer = (
    <div>
      <ul>
        <li>item</li>
      </ul>
    </div>
  )

  const bibDetails = (<BibDetails
    bib={sampleBib}
    fields={bottomFields}
    electronicResources={[]}
  />);

  const additionalDetails = (<AdditionalDetailsViewer bib={sampleBib} />);

  const component = mount(
    <Tabbed tabs={[
      { title: 'Availability', content: mockItemsContainer },
      { title: 'Details', content: bibDetails },
      { title: 'Full Description', content: additionalDetails }]}
    />
  );
  const details = component.find('a').at(0);
  const fullDescription = component.find('a').at(1);
  let focused;
  let section;

  describe('Initial Rendering', () => {
    it('should focus on Availability', () => {
      expect(component.find('a').length).to.be.at.least(3);
      expect(component.find('a').at(0).prop('aria-selected')).to.equal(true);
      expect(component.find('a').at(0).text()).to.equal('Availability');
    });

    it('should have a tab for Full Description', () => {
      expect(component.find('a').at(1).text()).to.equal('Details');
    });

    it('should have a tab for Full Description', () => {
      expect(component.find('a').at(2).text()).to.equal('Full Description');
    });
  });

  describe('Navigating with Click', () => {
    it('should focus on Full Description on click', () => {
      fullDescription.simulate('click');
      focused = document.activeElement;
      expect(fullDescription.getDOMNode()).to.equal(focused);
    });

    it('should focus on Details when clicked back', () => {
      details.simulate('click');
      focused = document.activeElement;
      expect(details.getDOMNode()).to.equal(focused);
    });
  })

  describe('Navigating with Key Press', () => {
    it('should focus on Full Description on Right Arrow Press', () => {
      details.simulate('keydown', { keyCode: 39, which: 39 });
      focused = document.activeElement;
      expect(fullDescription.getDOMNode()).to.equal(focused);
    });

    it('should focus on Details on Left Arrow Press', () => {
      fullDescription.simulate('keydown', { keycode: 37, which: 37 });
      focused = document.activeElement;
      expect(details.getDOMNode()).to.equal(focused);
    });
  });
});
