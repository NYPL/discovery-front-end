/* eslint import/prefer-default-export: "off" */
import { isEmpty as _isEmpty } from 'underscore';

import nyplApiClient from '../nyplApiClient';
import logger from '../../../../logger';

import { updatePatronData } from '../../../app/actions/Actions';
import { extractNoticePreference } from '../../../app/utils/utils';


export function getPatronData(req, res, next) {
  const { dispatch } = req.store;
  if (req.patronTokenResponse.isTokenValid
    && req.patronTokenResponse.decodedPatron
    && req.patronTokenResponse.decodedPatron.sub
  ) {
    const userId = req.patronTokenResponse.decodedPatron.sub;

    return nyplApiClient()
      .then(client =>
        client.get(`/patrons/${userId}`, { cache: false })
          .then((response) => {
            if (_isEmpty(response)) {
              // Data is empty for the Patron
              const patron = {
                id: '',
                names: [],
                barcodes: [],
                emails: [],
                loggedIn: false,
              };

              dispatch(updatePatronData(patron));
            } else {
              const {
                id,
                names,
                emails,
                moneyOwed,
                homeLibraryCode,
                patronType,
                expirationDate,
                phones,
              } = response.data;
              const barcodes = response.data.barCodes;
              const noticePreference = extractNoticePreference(response.data.fixedFields);
              // Data exists for the Patron
              const patron = {
                id,
                names,
                barcodes,
                emails,
                loggedIn: true,
                moneyOwed,
                homeLibraryCode,
                patronType,
                expirationDate,
                phones,
                noticePreference,
              };

              dispatch(updatePatronData(patron));
            }

            // Continue next function call
            next();
          })
          .catch((error) => {
            logger.error(
              'Error attemping to make server side fetch call to patrons in getPatronData' +
              `, /patrons/${userId}`,
              error,
            );
            const patron = {
              id: '',
              names: [],
              barcodes: [],
              emails: [],
              loggedIn: false,
            };

            dispatch(updatePatronData(patron));
            // Continue next function call
            next();
          }),
      );
  }

  const patron = {
    id: '',
    names: [],
    barcodes: [],
    emails: [],
    loggedIn: false,
  };

  dispatch(updatePatronData(patron));
  return next();
}
