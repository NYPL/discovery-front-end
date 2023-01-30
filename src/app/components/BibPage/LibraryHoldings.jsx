import { Heading } from '@nypl/design-system-react-components';
import PropTypes from 'prop-types';
import React from 'react';
import DefinitionList from './DefinitionList';

const LibraryHoldings = ({ holdings }) => {
  if (!holdings) {
    return null;
  }

  const liForEl = (el) => {
    if (typeof el === 'string') return <li>{el}</li>;
    if (!el.url) return <li>{el.label}</li>;
    return (
      <li>
        <a href={el.url}>{el.label}</a>
      </li>
    );
  };

  const htmlDefinitions = (holding) =>
    holding.holdingDefinition.map((definition) => ({
      term: definition.term,
      definition: <ul>{definition.definition.map((el) => liForEl(el))}</ul>,
    }));

  return (
    <React.Fragment>
      <Heading level="three">Holdings</Heading>
      {holdings.map((holding, index) => (
        <DefinitionList
          data={htmlDefinitions(holding)}
          key={index}
        />
      ))}
    </React.Fragment>
  );
};

LibraryHoldings.propTypes = {
  holdings: PropTypes.array,
};

export default LibraryHoldings;
