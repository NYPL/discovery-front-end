import PropTypes from 'prop-types';
import React, { createContext } from 'react';

/**
 * Wrapper context component to get patron data from the Redux store.
 */

export const PatronContext = createContext(null);
export const PatronProvider = ({ children, patron = {}}) => (
  <PatronContext.Provider value={patron}>
    {children}
  </PatronContext.Provider>
);

PatronProvider.propTypes = {
  children: PropTypes.node,
  patron: PropTypes.object,
};
