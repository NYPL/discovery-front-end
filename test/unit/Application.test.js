import { Application } from '@Application';
import { Header, navConfig } from '@nypl/dgx-header-component';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import { stub } from 'sinon';
import { breakpoints } from '../../src/app/data/constants';
import { mockRouterContext } from '../helpers/routing';

const resizeWindow = (size) => {
  window.innerWidth = size;
  window.dispatchEvent(new Event('resize'));
};

describe('Application', () => {
  let component;
  const context = mockRouterContext();

  before(() => {
    window.matchMedia = () => ({ addListener: () => undefined });
    window.matchMedia().addListener = stub();
    component = shallow(
      <Application
        route={{
          history: { listen: stub() },
        }}
        addFeatures={() => undefined}
      />,
      { context },
    );

    component.setState({ patron: {} });
  });

  it('should be wrapped in a .app-wrapper class', () => {
    expect(component.find('.app-wrapper')).to.be.defined;
    expect(component.find('.app-wrapper')).to.have.length(1);
  });

  it('should render the NYPL header', () => {
    expect(component.find('#nyplHeader')).to.have.length(1);
  });

  it('should have the skip navigation link enabled,', () => {
    expect(
      component.contains(
        <Header
          navData={navConfig.current}
          skipNav={{ target: 'mainContent' }}
          patron={component.state.patron}
        />,
      ),
    ).to.equal(true);
  });

  it('should render a <Footer /> components', () => {
    expect(component.find('Footer')).to.have.length(1);
  });

  describe('should set media type in context', () => {
    const breakpointObj = {};
    breakpoints.forEach(
      (breakpoint) => (breakpointObj[breakpoint.media] = breakpoint.maxValue),
    );
    const { tablet, tabletPortrait, mobile } = breakpointObj;

    it(`should set media as "desktop" for screenwidths above ${tablet}px`, () => {
      resizeWindow(tablet + 1);
      expect(component.state().media).to.eql('desktop');
    });
    it(`should set media as "tablet" for screenwidths ${
      tabletPortrait + 1
    }-${tablet}px`, () => {
      resizeWindow(tabletPortrait + 1);
      expect(component.state().media).to.eql('tablet');
      resizeWindow(tablet);
      expect(component.state().media).to.eql('tablet');
    });
    it(`should set media as "tabletPortrait" for screenwidths ${
      mobile + 1
    }-${tabletPortrait}px`, () => {
      resizeWindow(mobile + 1);
      expect(component.state().media).to.eql('tabletPortrait');
      resizeWindow(tabletPortrait);
      expect(component.state().media).to.eql('tabletPortrait');
    });
    it(`should set media as "mobile" for screenwidths below ${mobile}`, () => {
      resizeWindow(mobile);
      expect(component.state().media).to.eql('mobile');
    });
  });

  describe('url-enabled feature flag', () => {
    let content;
    before(() => {
      window.matchMedia = () => ({ addListener: () => undefined });
      window.matchMedia().addListener = stub();
      context.router = {
        location: {
          query: {
            features: 'on-site-edd',
          },
        },
        listen: stub(),
      };
      component = shallow(
        <Application
          router={context.router}
          updateFeatures={() => undefined}
          features={[]}
        >
          <a href='/subject_headings'>link</a>
        </Application>,
        { context },
      );
    });

    it('sets `urlEnabledFeatures` state from `router.location.query.features`', () => {
      expect(component.state().urlEnabledFeatures).to.equal('on-site-edd');
    });
  });
});
