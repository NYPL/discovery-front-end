import React from 'react';
import PropTypes from 'prop-types';
import {
  extend as _extend,
  findWhere as _findWhere,
} from 'underscore';

import {
  getUpdatedFilterValues,
} from '../../utils/utils';

class FieldsetList extends React.Component {
  constructor(props) {
    super(props);

    const updatedFilterValues = getUpdatedFilterValues(props);

    this.state = {
      values: updatedFilterValues,
    };

    this.onFilterClick = this.onFilterClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const updatedFilterValues = getUpdatedFilterValues(nextProps);

    this.setState({
      values: updatedFilterValues,
    });
  }

  onFilterClick(e, filter) {
    // Find the filter we selected and toggle it's selected value.
    const match = _findWhere(this.state.values, { value: filter.value });

    if (match) {
      filter.selected = !filter.selected;
    }
    this.props.onFilterClick(this.props.filterId, filter);
  }

  render() {
    const {
      legend,
      filterId,
    } = this.props;
    const values = this.state.values;

    if (!values || !values.length) {
      return null;
    }

    return (
      <fieldset className="nypl-fieldset inner">
        {legend && <legend><h3>{legend}</h3></legend>}
        <ul className="nypl-generic-checkbox nypl-generic-columns">
          {
            values.map((filter) => {
              let filterLabel = filter.label;
              if (filter.label === 'Greek, Modern (1453- )') {
                filterLabel = 'Greek, Modern (1453-present)';
              }

              return (
                <li className="nypl-generic-checkbox" key={filter.value}>
                  <input
                    id={`${filter.label}-label`}
                    type="checkbox"
                    name="filters"
                    value={JSON.stringify(_extend({ field: filterId }, filter))}
                    onClick={e => this.onFilterClick(e, filter)}
                    checked={filter.selected}
                  />
                  <label htmlFor={`${filter.label}-label`}>
                    {filterLabel} {filter.count ? `(${filter.count.toLocaleString()})` : null}
                  </label>
                </li>
              );
            })
          }
        </ul>
      </fieldset>
    );
  }
}

FieldsetList.propTypes = {
  legend: PropTypes.string,
  filterId: PropTypes.string,
  onFilterClick: PropTypes.func,
};

FieldsetList.defaultProps = {
  onFilterClick: () => {},
};

export default FieldsetList;
