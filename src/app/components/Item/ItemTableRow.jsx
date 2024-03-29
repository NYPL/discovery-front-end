import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty as _isEmpty } from 'underscore';

import appConfig from '../../data/appConfig';
import StatusLinks from './StatusLinks';

class ItemTableRow extends React.Component {
  constructor (props) {
    super(props);
    this.message = this.message.bind(this)
  }

  message () {
    const { item } = this.props;

    return item.accessMessage.prefLabel || ' ';
  }

  render () {
    const {
      item,
      includeVolColumn,
      bibId,
      searchKeywords,
      page,
      isBibPage,
      isDesktop
    } = this.props;

    if (_isEmpty(item)) {
      return null;
    }

    if (item.isElectronicResource) {
      return null;
    }

    let itemCallNumber = ' ';
    if (item.callNumber) {
      itemCallNumber = item.callNumber;
    }

    return (
      <tr className={item.availability}>
        {isBibPage ? (
          <td className={`status-links ${isDesktop ? '' : 'mobile'}`}><StatusLinks
            item={item}
            bibId={bibId}
            searchKeywords={searchKeywords}
            appConfig={appConfig}
            page={page}
          /></td>
        ) : null}
        {includeVolColumn ? (
          <td className="vol-date-col" data-th="Vol/Date">
            <span>{item.volume || ''}</span>
          </td>
        ) : null}
        <td data-th="Format">
          <span>{item.format || ' '}</span>
        </td>
        {
          (!includeVolColumn && !isDesktop) ?
          <td data-th="Call Number"><span>{itemCallNumber}</span></td> :
          null
        }
        {isBibPage && isDesktop ? <td data-th="Access">{this.message()}</td> : null}
        {isDesktop ? <> <td data-th="Call Number"><span>{itemCallNumber}</span></td>
          <td data-th="Location"><span>{item.location}</span></td></> : null}
      </tr>
    );
  }
}

ItemTableRow.propTypes = {
  item: PropTypes.object,
  bibId: PropTypes.string,
  searchKeywords: PropTypes.string,
};

ItemTableRow.contextTypes = {
  router: PropTypes.object,
};

export default ItemTableRow;
