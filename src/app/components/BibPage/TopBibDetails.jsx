import PropTypes from 'prop-types';
import React from 'react';
// import BibDetails from './BibDetails';
import BibDetails_Functional from './BibDetails_Functional';

// `linkable` means that those values are links inside the app.
// `selfLinkable` means that those values are external links and should be self-linked,
// e.g. the prefLabel is the label and the URL is the id.
const topFields = [
  { label: 'Title', value: 'titleDisplay' },
  { label: 'Author', value: 'creatorLiteral', linkable: true },
  { label: 'Publication', value: 'publicationStatement' },
  { label: 'Electronic Resource', value: 'React Component' },
  {
    label: 'Supplementary Content',
    value: 'supplementaryContent',
    selfLinkable: true,
  },
];

const TopBibDetails = ({ resources = [] }) => {
  return (
    <section style={{ marginTop: '20px' }}>
      <BibDetails_Functional
        logging
        fields={topFields}
        electronicResources={resources}
      />
      {/* <BibDetails
        logging
        bib={bib}
        fields={topFields}
        electronicResources={resources}
      /> */}
    </section>
  );
};

TopBibDetails.propTypes = {
  resources: PropTypes.array.isRequired,
};

TopBibDetails.defaultProps = {
  resources: [],
};

export default TopBibDetails;
