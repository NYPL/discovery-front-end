import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import axios from 'axios';
import Actions from '../../actions/Actions';

class ItemHoldings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false,
    };

    this.getRecord = this.getRecord.bind(this);
  }

  getRecord(e, id, path) {
    e.preventDefault();

    axios
      .get(`/api/retrieve?q=${id}`)
      .then(response => {
        console.log(response.data);
        Actions.updateBib(response.data);
        this.context.router.push(`/${path}/${id}`);
      })
      .catch(error => {
        console.log(error);
      });
  }

  getRow(holdings) {
    const holdingCount = holdings.length;
    const maxDisplay = 7;
    const moreCount = holdingCount - maxDisplay;
    const collapsed = !this.state.expanded;

    return (
      <table className="nypl-basic-table">
      <caption className="hidden">item holdings</caption>
        <tbody>
          {
            holdings.map((h, i) => {
              let itemLink;
              let itemDisplay = null;

              if (h.requestHold) {
                itemLink = h.availability === 'available' ?
                  <Link
                    className="button"
                    to={`/hold/request/${this.props.itemId}`}
                    onClick={(e) => this.getRecord(e, this.props.itemId, 'hold/request')}
                  >Request</Link> :
                  <span className="nypl-item-unavailable">Unavailable</span>;
              }

              if (h.callNumber) {
                itemDisplay = <span dangerouslySetInnerHTML={this.createMarkup(h.callNumber)}></span>;
              } else if (h.isElectronicResource) {
                itemDisplay = <span>{h.location}</span>;
              }

              return (
                <tr
                  key={i}
                  className={`${h.availability} ${i >= maxDisplay && collapsed ? 'collapsed' : ''}`}
                >
                  <td>{h.location}</td>
                  <td>{itemDisplay}</td>
                  <td>{h.status}</td>
                  <td>{h.accessMessage}</td>
                  <td>{itemLink}</td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    );
  }

  showMoreItems(e) {
    e.preventDefault();
    this.setState({ expanded: true });
  }

  createMarkup(html) {
    return {
      __html: html,
    };
  }

  render() {
    const holdings = this.props.holdings;
    const body = this.getRow(holdings);

    return (
      <div id="item-holdings" className="nypl-item-holdings">
        <h2>{this.props.title}</h2>
        {body}
      </div>
    );
  }
}

ItemHoldings.propTypes = {
  holdings: PropTypes.array,
  title: PropTypes.string,
  bibId: PropTypes.string,
};

ItemHoldings.contextTypes = {
  router: PropTypes.object,
};

export default ItemHoldings;
