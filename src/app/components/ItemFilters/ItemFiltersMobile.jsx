import { ModalTrigger } from '@nypl/design-system-react-components';
import PropTypes from 'prop-types';
import React from 'react';

import ItemFilter from './ItemFilter';
import DateSearchBar from './DateSearchBar';

/**
 * This renders the button that acts as a Modal Trigger. Clicking the button
 * opens a Modal from the new Reservoir Design System, which contains the 
 * items filters.
 */
const ItemFiltersMobile = ({
  displayDateFilter,
  itemsAggregations,
  manageFilterDisplay,
  selectedFields,
  setSelectedFields,
  submitFilterSelections,
  initialFilters,
  selectedYear,
  setSelectedYear,
  fieldToOptionsMap }) => {
  if (!itemsAggregations) return null;
  const showResultsAction = () => {
    submitFilterSelections();
  };
  const modalProps = {
    bodyContent: (
      <div className="scc-item-filters" id="item-filters-mobile">
        <div id="item-filters" className="item-table-filters">
          {
            itemsAggregations.map(field => (
              <ItemFilter
                field={field.field}
                key={field.id}
                options={field.options}
                mobile
                manageFilterDisplay={manageFilterDisplay}
                selectedFields={selectedFields}
                setSelectedFields={setSelectedFields}
                submitFilterSelections={submitFilterSelections}
                initialFilters={initialFilters}
                fieldToOptionsMap={fieldToOptionsMap}
              />
            ))
          }
        </div>
      </div>
    ),
    headingText: "Filters",
    closeButtonLabel: "Show Results",
    onClose: () => {
      showResultsAction()
    }
  }

  // On mobile, the date input field is rendered outside of the modal.
  return (
    <>
      {displayDateFilter && <DateSearchBar
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        submitFilterSelections={submitFilterSelections}
      />}
      <ModalTrigger
        buttonType="secondary"
        className="item-table-filters"
        id="filters-button"
        buttonText="Filters"
        modalProps={modalProps}
      />
    </>
  );
};

ItemFiltersMobile.propTypes = {
  displayDateFilter: PropTypes.bool,
  itemsAggregations: PropTypes.array,
  manageFilterDisplay: PropTypes.func,
  selectedFields: PropTypes.object,
  setSelectedFields: PropTypes.func,
  submitFilterSelections: PropTypes.func,
  initialFilters: PropTypes.object,
  selectedYear: PropTypes.string,
  setSelectedYear: PropTypes.func,
  fieldToOptionsMap: PropTypes.object
};

ItemFiltersMobile.contextTypes = {
  router: PropTypes.object,
};

export default ItemFiltersMobile;

