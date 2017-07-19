import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { isEmpty as _isEmpty } from 'underscore';

const createMarkup = (html) => ({ __html: html });

const ItemTableRow = ({ item, bibId, getRecord }) => {
  if (_isEmpty(item)) {
    return null;
  }

  let itemLink;
  let itemDisplay = null;

  if (item.requestHold) {
    itemLink = item.available ?
      <button
        to={`/hold/request/${bibId}-${item.id}`}
        onClick={(e) => getRecord(e, bibId, item.id)}
        tabIndex="0"
      >Request</button> :
      <span>{item.status.prefLabel}</span>;
  }

  if (item.callNumber) {
    itemDisplay = <span dangerouslySetInnerHTML={createMarkup(item.callNumber)}></span>;
  } else if (item.isElectronicResource) {
    itemDisplay = <span>{item.location}</span>;
  }

  return (
    <tr className={item.availability}>
      <td>{item.location}</td>
      <td>{itemDisplay}</td>
      <td>{itemLink}</td>
      <td>{item.accessMessage.prefLabel}</td>
    </tr>
  );
};

ItemTableRow.propTypes = {
  item: PropTypes.object,
  bibId: PropTypes.string,
  getRecord: PropTypes.func,
};

export default ItemTableRow;
