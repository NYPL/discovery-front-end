import { Heading } from '@nypl/design-system-react-components';
import SubjectHeadingShow from '@SubjectHeadingShow';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import SubjectHeadingShowPage from './../../src/app/pages/SubjectHeadingShowPage';

describe('SubjectHeadingsIndexPage', () => {
  let component;
  before(() => {
    component = shallow(
      <SubjectHeadingShowPage
        params={{ subjectHeadingUuid: '1234' }}
        location={{ query: '' }}
      />,
    );
  });
  it('should render `SubjectHeadingSearch`', () => {
    expect(component.find('SubjectHeadingSearch').length).to.equal(1);
  });
});

describe('SubjectHeadingShow', () => {
  const params = {
    subjectHeadingUuid: '1',
  };
  const wrapper = shallow(<SubjectHeadingShow params={params} />, {
    context: { router: { location: { search: '' } } },
  });
  const instance = wrapper.instance();
  describe('finding uuid', () => {
    it('should accept a list containing a subject heading with correct uuid', () => {
      const headings = [{ uuid: '2' }, { uuid: '1' }, { uuid: '3' }];
      expect(instance.hasUuid(headings)).to.equal(true);
    });

    it('should accept a list containing a nested subject heading with correct uuid', () => {
      const headings = [
        { uuid: '2' },
        { uuid: '4' },
        { uuid: '3', children: [{ uuid: '1' }] },
      ];
      expect(instance.hasUuid(headings)).to.equal(true);
    });

    it('should accept an object with correct uuid', () => {
      const headings = { uuid: '1' };
      expect(instance.hasUuid(headings)).to.equal(true);
    });

    it('should accept an object containing a nested subject heading with correct uuid', () => {
      const headings = {
        uuid: '3',
        children: [{ uuid: '4', children: [{ uuid: '1' }] }],
      };
      expect(instance.hasUuid(headings)).to.equal(true);
    });

    it('should reject an object if no subject heading has the correct id', () => {
      const headings = {
        uuid: '3',
        children: [{ uuid: '4', children: [{ uuid: '6' }] }],
      };
      expect(instance.hasUuid(headings)).to.equal(false);
    });

    it('should reject a list if no subject heading has the correct id', () => {
      const headings = [
        { uuid: '2' },
        { uuid: '4' },
        { uuid: '3', children: [{ uuid: '5' }] },
      ];
      expect(instance.hasUuid(headings)).to.equal(false);
    });
  });

  describe('should not have .drbb-integration classes', () => {
    it('should not have any components with .drbb-integration class', () => {
      expect(wrapper.find('.drbb-integration')).to.have.length(0);
    });
  });

  describe('when receiving a label', () => {
    let component;
    before(() => {
      component = shallow(
        <SubjectHeadingShowPage
          params={{
            subjectHeadingUuid: 'asdfadsfakld',
          }}
          location={{
            query: {
              label: 'Kermit the Frog',
            },
          }}
        />,
      );
    });

    it('should render a heading with the label', () => {
      expect(component.find(Heading).prop('children')).to.equal(
        'Subject Heading "Kermit the Frog"',
      );
    });
  });
});
