import PropTypes from 'prop-types';
import React from 'react';
import BibDetails from './BibDetails';

// `linkable` means that those values are links inside the app.
// `selfLinkable` means that those values are external links and should be self-linked,
// e.g. the prefLabel is the label and the URL is the id.
const topFields = [
  { label: 'Title', value: 'titleDisplay' },
  { label: 'Author', value: 'creatorLiteral', linkable: true },
  { label: 'Publication', value: 'publicationStatement' },
  {
    label: 'Electronic Resource',
    value: 'React Component',
    linkable: true,
    selfLinkable: true,
  },
  {
    label: 'Supplementary Content',
    value: 'supplementaryContent',
    linkable: true,
    selfLinkable: true,
  },
];

const TopBibDetails = ({ resources = [], bib }) => {
  return (
    // TODO: [SCC-3128] Replace Styles with ClassName or Constant
    <section style={{ marginTop: '20px' }}>
      <BibDetails fields={topFields} resources={resources} bib={bib} />
    </section>
  );
};

TopBibDetails.propTypes = {
  resources: PropTypes.array.isRequired,
  bib: PropTypes.object,
};

TopBibDetails.defaultProps = {
  resources: [],
};

export default TopBibDetails;
