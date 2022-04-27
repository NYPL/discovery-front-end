import PropTypes from 'prop-types';
import React from 'react';
import { useBibParallel } from '../../context/Bib.Provider';
import {
  combineBibDetailsData,
  groupNotesBySubject,
  setParallelToNote,
} from '../../utils/bibDetailsUtils';
import LibraryItem from '../../utils/item';
import { isArray, isEmpty } from '../../utils/utils';
import DefinitionField from './components/DefinitionField';
import DefinitionNoteField from './components/DefinitionNoteField';
import DefinitionList from './DefinitionList';

const BibDetails = ({ fields = [], resources = [], marcs }) => {
  const {
    bib,
    bib: { subjectHeadingData },
    parallels,
  } = useBibParallel();

  // Loops through fields and builds the Definition Field Component
  const definitions = fields.reduce((store, field) => {
    const value =
      bib[field.value] ??
      // Allow origin to be resources
      (field.label === 'Electronic Resource' && resources.length && resources);

    if (field.value === 'note' && value) {
      const paras = (parallels['note'] && parallels['note'].parallel) || [];
      const group = groupNotesBySubject(setParallelToNote(value, paras));

      return [
        ...store,
        // In order to get the noteType as a label
        // we need to process this here
        ...Object.entries(group).map(([label, notes]) => {
          // type notes = Note[]
          return {
            // term is the label of the feild
            term: label,
            // definition is the value of the label
            definition: <DefinitionNoteField values={notes} />,
          };
        }),
      ];
    }

    if (value) {
      const ident = validIdentifier(field, value);
      // To avoid adding a label with empty array for identifiers
      if (ident && !ident.length) return store;

      return [
        ...store,
        {
          term: field.label,
          definition: (
            <DefinitionField bibValues={ident ?? value} field={field} />
          ),
        },
      ];
    }

    return store;
  });

  // Make sure fields is a nonempty array
  if (isEmpty(fields) || !isArray(fields)) {
    return null;
  }

  const data = combineBibDetailsData(definitions, marcs);

  return <DefinitionList data={data} headings={subjectHeadingData} />;
};

BibDetails.propTypes = {
  fields: PropTypes.array.isRequired,
  resources: PropTypes.array,
  marcs: PropTypes.array,
};

BibDetails.defaultProps = {
  marcs: [],
  resources: [],
  fields: [],
};

BibDetails.contextTypes = {
  router: PropTypes.object,
};

export default BibDetails;

function validIdentifier(field, value) {
  return field.value === 'identifier'
    ? LibraryItem.getIdentifierEntitiesByType(value, field.identifier)
    : null;
}
