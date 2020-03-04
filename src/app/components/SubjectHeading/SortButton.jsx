import React from 'react';
import PropTypes from 'prop-types';

const SortButton = (props) => {
  const columnText = () => ({
    bibs: 'Titles',
    descendants: 'Subheadings',
    alphabetical: 'Heading',
  }[props.type]);

  return (
    <button
      className="subjectSortButton"
      onClick={() => props.handler(props.type, props.direction)}
      disabled={!props.handler}
    >
      <span className="emph">
        <span className="noEmph">{columnText()}
          {props.handler ? <span className="sortCharacter">^</span> : null}
        </span>
      </span>
    </button>
  );
};

SortButton.propTypes = {
  handler: PropTypes.func,
  type: PropTypes.string,
  direction: PropTypes.string,
};

export default SortButton;
