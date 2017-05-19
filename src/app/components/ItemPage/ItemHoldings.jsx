import React from 'react';
import { Link } from 'react-router';

class ItemHoldings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false,
    };
  }

  getRow(holdings) {
    const holdingCount = holdings.length;
    const maxDisplay = 7;
    const moreCount = holdingCount - maxDisplay;
    const collapsed = !this.state.expanded;

    return (
      <ul>
        {
          holdings.map((h, i) => (
            <li
              key={i}
              className={`${h.availability} ${i >= maxDisplay && collapsed ? 'collapsed' : ''}`}
            >
              <span>
                {
                  h.url && h.url.length ?
                    <a
                      href={h.url}
                    >
                      Request
                    </a>
                  : <span className="nypl-item-unavailable">Unavailable</span>
                }
              </span>
              <span dangerouslySetInnerHTML={this.createMarkup(h.callNumber)}></span>
            </li>
          ))
        }
      </ul>
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
  holdings: React.PropTypes.array,
  title: React.PropTypes.string,
};

export default ItemHoldings;
