/* global window, document */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  SkeletonLoader,
  Heading,
} from '@nypl/design-system-react-components';

import Search from '../components/Search/Search';
import LinkTabSet from '../components/AccountPage/LinkTabSet';
import AccountSettings from '../components/AccountPage/AccountSettings';
import LoadingLayer from '../components/LoadingLayer/LoadingLayer';
import TimedLogoutModal from '../components/TimedLogoutModal/TimedLogoutModal';
import CancelConfirmationModal from '../components/AccountPage/CancelConfirmationModal';
import SccContainer from '../components/SccContainer/SccContainer';
import { logOutFromEncoreAndCatalogIn } from '../utils/logoutUtils';

import { manipulateAccountPage, makeRequest, buildReqBody, formatPatronExpirationDate } from '../utils/accountPageUtils';
import {
  basicQuery,
} from '../utils/utils';


const AccountPage = (props, context) => {
  const { patron, accountHtml, appConfig } = useSelector(state => ({
    patron: state.patron,
    accountHtml: state.accountHtml,
    appConfig: state.appConfig,
  }));

  const content = props.params.content || 'items';

  const dispatch = useDispatch();
  const updateAccountHtml = newContent => dispatch({
    type: 'UPDATE_ACCOUNT_HTML',
    payload: newContent,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [itemToCancel, setItemToCancel] = useState(null);
  const [displayTimedLogoutModal, setDisplayTimedLogoutModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (!patron.id || accountHtml.error)) {
      const fullUrl = encodeURIComponent(window.location.href);
      logOutFromEncoreAndCatalogIn(() => {
        window.location.replace(`${appConfig.loginUrl}?redirect_uri=${fullUrl}`);
      });
    }
  }, [patron]);

  useEffect(() => {
    if (content === 'settings') {
      setIsLoading(false);
      return;
    }
    const accountPageContent = document.getElementById('account-page-content');

    if (accountPageContent) {
      const eventListeners = manipulateAccountPage(
        accountPageContent,
        updateAccountHtml,
        patron,
        content,
        setIsLoading,
        setItemToCancel,
      );

      return () => {
        if (eventListeners) {
          eventListeners.forEach(({ element, cb }) => {
            element.removeEventListener('click', cb);
          });
        }
      };
    }
  }, [accountHtml]);

  const resetCountdown = () => {
    const now = new Date();
    now.setTime(now.getTime() + (5 * 60 * 1000));
    const inFive = now.toUTCString();
    document.cookie = `accountPageExp=${inFive}; expires=${inFive}`;
    setDisplayTimedLogoutModal(true);
  };

  useEffect(() => {
    resetCountdown();
  });

  const { baseUrl } = appConfig;

  const cancelItem = () => {
    const body = buildReqBody(content, {
      currentsortorder: 'current_pickup',
      updateholdssome: 'YES',
      [itemToCancel.name]: itemToCancel.value,
    });

    makeRequest(
      updateAccountHtml,
      patron.id,
      body,
      content,
      setIsLoading,
    );

    setItemToCancel(null);
  };

  const formattedExpirationDate = patron.expirationDate ? formatPatronExpirationDate(patron.expirationDate) : '';

  if (accountHtml.error) {
    return (
      <LoadingLayer loading={true} />
    );
  }

  return (
    <SccContainer
      activeSection="account"
      pageTitle="Account"
    >
      <div className="content-header research-search">
        <div className="research-search__inner-content">
          <Search
            router={context.router}
            createAPIQuery={basicQuery()}
          />
        </div>
      </div>
      <div className="nypl-patron-page">
        <Heading
          level={2}
          id="2"
          text="My Account"
        />
        {
          displayTimedLogoutModal ?
            <TimedLogoutModal
              stayLoggedIn={resetCountdown}
              baseUrl={baseUrl}
            /> :
            null
        }
        {
          itemToCancel ? (
            <CancelConfirmationModal
              itemToCancel={itemToCancel}
              setItemToCancel={setItemToCancel}
              cancelItem={cancelItem}
            />
          ) : null
        }
        <div className="nypl-patron-details">
          <div className="name">{patron.names ? patron.names[0] : null}</div>
          <div>{patron.barcodes ? patron.barcodes[0] : null}</div>
          <div>Expiration Date: {formattedExpirationDate}</div>
        </div>
        <LinkTabSet
          activeTab={content}
          tabs={[
            {
              label: 'Checkouts',
              link: `${baseUrl}/account/items`,
              content: 'items'
            },
            {
              label: 'Holds',
              link: `${baseUrl}/account/holds`,
              content: 'holds',
            },
            {
              label: `Fines${patron.moneyOwed ? ` ($${patron.moneyOwed.toFixed(2)})` : ''}`,
              link: `${baseUrl}/account/overdues`,
              content: 'overdues',
            },
            {
              label: 'Account Settings',
              link: `${baseUrl}/account/settings`,
              content: 'settings',
            },
          ]}
        />
        {isLoading && content !== 'settings' ? <SkeletonLoader /> : ''}
        {
          typeof accountHtml === 'string' && content !== 'settings' ? (
            <div
              dangerouslySetInnerHTML={{ __html: accountHtml }}
              id="account-page-content"
              className={`${content} ${isLoading ? 'loading' : ''}`}
            />
          ) : ''
        }
        {
          content === 'settings' ? (
            <AccountSettings
              patron={patron}
              legacyBaseUrl={appConfig.legacyBaseUrl}
            />
          ) : null
        }
      </div>
    </SccContainer>
  );
};

AccountPage.propTypes = {
  params: PropTypes.object,
};

AccountPage.contextTypes = {
  router: PropTypes.object,
};

export default AccountPage;
