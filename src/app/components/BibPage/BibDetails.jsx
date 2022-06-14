import { Link } from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import {
  isArray as _isArray,
  isEmpty as _isEmpty,
  isObject as _isObject,
} from 'underscore';

// Components
import DefinitionList from './DefinitionList';
// Utils and configs
import appConfig from '../../data/appConfig';
import { combineBibDetailsData } from '../../utils/bibDetailsUtils';
import getOwner from '../../utils/getOwner';
import LibraryItem from '../../utils/item';
import {RouterContext} from "../../pages/BibPage";
import { trackDiscovery } from '../../utils/utils';


const BibDetails = (props) => {
  const { router } = React.useContext(RouterContext);

  /**
   * Return note array or null.
   *
   * @param {object} bib
   * @return {null|array}
   */
  const getNote = (bib) => {
    const note = bib.note;
    return note && note.length ? note : null;
  };
  /**
   * getDefinitionObject(bibValues, fieldValue, fieldLinkable, fieldSelfLinkable, fieldLabel)
   * Gets a list, or one value, of data to display for a field from the API, where
   * the data is an object in the array.
   *
   * @param {array} bibValues - the value(s) of the current field
   * @param {string} fieldValue - the name of the current field
   * @param {boolean} fieldLinkable - flags true if the field should be clickable
   * @param {boolean} fieldSelfLinkable - flags true if the Bib field already has a URL
   * @param {string} fieldLabel - offers the type of search keywords
   * @return {HTML element}
   */
   const getDefinitionObject = (
    bibValues,
    fieldValue,
    fieldLinkable,
    fieldSelfLinkable,
    fieldLabel,
  ) => {
    // If there's only one value, we just want that value and not a list.
    if (bibValues.length === 1) {
      const bibValue = bibValues[0];
      const url = `filters[${fieldValue}]=${bibValue['@id']}`;

      if (fieldLinkable) {
        return (
          <Link
            onClick={(event) =>
              newSearch(
                event,
                url,
                fieldValue,
                bibValue['@id'],
                fieldLabel,
              )
            }
            to={`${appConfig.baseUrl}/search?${url}`}
          >
            {bibValue.prefLabel}
          </Link>
        );
      }

      if (fieldSelfLinkable) {
        return (
          <a
            href={bibValue['@id']}
            onClick={() =>
              trackDiscovery(
                'Bib fields',
                `${fieldLabel} - ${bibValue.prefLabel}`,
              )
            }
          >
            {bibValue.prefLabel}
          </a>
        );
      }

      return <span>{bibValue.prefLabel}</span>;
    }

    return (
      <ul className="additionalDetails">
        {bibValues.map((value) => {
          const url = `filters[${fieldValue}]=${value['@id']}`;
          let itemValue = fieldLinkable ? (
            <Link
              onClick={(event) =>
                newSearch(event, url, fieldValue, value['@id'], fieldLabel)
              }
              to={`${appConfig.baseUrl}/search?${url}`}
            >
              {value.prefLabel}
            </Link>
          ) : (
            <span>{value.prefLabel}</span>
          );
          if (fieldSelfLinkable) {
            itemValue = (
              <a
                href={value['@id']}
                onClick={() =>
                  trackDiscovery(
                    'Bib fields',
                    `${fieldLabel} - ${value.prefLabel}`,
                  )
                }
              >
                {value.prefLabel}
              </a>
            );
          }

          return <li key={value.prefLabel}>{itemValue}</li>;
        })}
      </ul>
    );
  }

  /**
   * Given an array of identifier entities and an rdf:type, returns markup to
   * render the values - if any - for the requested type.
   *
   * @param {array<object>} bibValues - Array of entities to inspect
   * @param {string} identifierType - The rdf:type to get (e.g. bf:Isbn)
   */
  const getIdentifiers = (bibValues, identifierType) => {
    const entities = LibraryItem.getIdentifierEntitiesByType(
      bibValues,
      identifierType,
    );
    if (Array.isArray(entities) && entities.length > 0) {
      const markup = entities.map((ent) => {
        const nodes = [<span key={`${ent['@value']}`}>{ent['@value']}</span>];
        if (ent.identifierStatus)
          nodes.push(
            <span key={`${ent['@value']}`}>
              {' '}
              <em>({ent.identifierStatus})</em>
            </span>,
          );
        return nodes;
      });

      return markup.length === 1 ? (
        markup.pop()
      ) : (
        <ul>
          {markup.map((mark) => (
            <li key={mark[0].key}>{mark}</li>
          ))}
        </ul>
      );
    }
    return null;
  }

  /**
   * getDefinition(bibValues, fieldValue, fieldLinkable, fieldIdentifier,
   * fieldSelfLinkable, fieldLabel)
   * Gets a list, or one value, of data to display for a field from the API.
   *
   * @param {array} bibValues - the value(s) of the current field
   * @param {string} fieldValue - the name of the current field
   * @param {boolean} fieldLinkable  - flags true if the field should be clickable
   * @param {string} fieldIdentifier
   * @param {string} fieldSelfLinkable - flags true if the Bib field already has a URL
   * @param {string} fieldLabel - offers the type of search keywords
   * @return {HTML element}
   */
  const getDefinition = (
    bibValues,
    fieldValue,
    fieldLinkable,
    fieldIdentifier,
    fieldSelfLinkable,
    fieldLabel,
  ) => {
    if (fieldValue === 'identifier') {
      return getIdentifiers(bibValues, fieldIdentifier);
    }

    if (bibValues.length === 1) {
      const bibValue = bibValues[0];

      const url = `filters[${fieldValue}]=${bibValue}`;
      return getDefinitionOneItem(
        bibValue,
        url,
        bibValues,
        fieldValue,
        fieldLinkable,
        fieldIdentifier,
        fieldSelfLinkable,
        fieldLabel,
      );
    }

    return (
      <ul>
        {bibValues.map((value) => {
          const queryString =  typeof value === 'string' ? value : value.label;
          const url = `filters[${fieldValue}]=${encodeURIComponent(queryString)}`

          return (
            <li
              key={`filter${fieldValue}${
                typeof value === 'string' ? value : value.label
              }`}
            >
              {getDefinitionOneItem(
                value,
                url,
                bibValues,
                fieldValue,
                fieldLinkable,
                fieldIdentifier,
                fieldSelfLinkable,
                fieldLabel,
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  /**
   * getDefinitionOneItem (bibValue, url, bibValues, fieldValue, fieldLinkable, fieldIdentifier,
   * fieldSelfLinkable, fieldLabel)
   * Gets the value for a single Bib detail field.
   *
   * @param {string} bibValue - the value for the current field
   * @param {string} url - for constructing the query values of the URLs
   * @param {string} bibValues
   * @param {string} fieldValue - the name of the current field
   * @param {boolean} fieldLinkable - if the field should be clickable
   * @param {string} fieldIdentifier
   * @param {boolean} fieldSelfLinkable - if the Bib field already has a URL
   * @param {string} fieldLabel - offers the type of search keywords
   * @return {HTML element}
   */
  const getDefinitionOneItem = (
    bibValue,
    url,
    bibValues,
    fieldValue,
    fieldLinkable,
    fieldIdentifier,
    fieldSelfLinkable,
    fieldLabel,
  ) => {
    if (fieldValue === 'subjectLiteral') {
      return constructSubjectHeading(
        bibValue,
        url,
        fieldValue,
        fieldLabel,
      );
    }

    if (fieldLinkable) {
      return (
        <Link
          onClick={(event) =>
            newSearch(event, url, fieldValue, bibValue, fieldLabel)
          }
          to={`${appConfig.baseUrl}/search?${url}`}
        >
          {bibValue}
        </Link>
      );
    }

    if (fieldSelfLinkable) {
      return (
        <a
          href={bibValue.url}
          onClick={() =>
            trackDiscovery(
              'Bib fields',
              `${fieldLabel} - ${bibValue.prefLabel}`,
            )
          }
        >
          {bibValue.prefLabel || bibValue.label || bibValue.url}
        </a>
      );
    }

    return <span>{bibValue}</span>;
  }

  /**
   * getNoteType(note)
   * Construct label for a note by adding the word 'Note'
   *
   * @param {object} note
   * @return {string}
   */

  const getNoteType = (note) => {
    const type = note.noteType || '';
    return type.toLowerCase().includes('note') ? type : `${type} (note)`;
  }

  /**
   * getDisplayFields(bib)
   * Get an array of definition term/values.
   *
   * @param {object} bib
   * @return {array}
   */
  const getDisplayFields = (bib) => {
    // A value of 'React Component' just means that we are getting it from a
    // component rather than from the bib field properties.
    const fields = props.fields;
    const fieldsToRender = [];

    fields.forEach((field) => {
      const fieldLabel = field.label;
      const fieldValue = field.value;
      const fieldLinkable = field.linkable;
      const fieldSelfLinkable = field.selfLinkable;
      const fieldIdentifier = field.identifier;
      let bibValues = bib[fieldValue];

      if (fieldValue === 'subjectLiteral') {
        bibValues = compressSubjectLiteral(bib[fieldValue]);
      }

      // skip absent fields
      if (bibValues && bibValues.length && _isArray(bibValues)) {
        // Taking just the first value for each field to check the type.
        const firstFieldValue = bibValues[0];

        // Each value is an object with @id and prefLabel properties.
        if (firstFieldValue['@id']) {
          fieldsToRender.push({
            term: fieldLabel,
            definition: getDefinitionObject(
              bibValues,
              fieldValue,
              fieldLinkable,
              fieldSelfLinkable,
              fieldLabel,
            ),
          });
        } else {
          const definition = getDefinition(
            bibValues,
            fieldValue,
            fieldLinkable,
            fieldIdentifier,
            fieldSelfLinkable,
            fieldLabel,
          );
          if (definition) {
            fieldsToRender.push({
              term: fieldLabel,
              definition,
            });
          }
        }
      }

      // The Owner is complicated too.
      if (fieldLabel === 'Owning Institutions') {
        const owner = getOwner(props.bib);
        if (owner) {
          fieldsToRender.push({
            term: fieldLabel,
            definition: owner,
          });
        }
      }

      // Note field rendering as array of objects instead of an array of strings.
      // Parse the original and new note format.
      // Original format: ['string1', 'string2']
      // 2018 format:
      //    [{'noteType': 'string',
      //     'prefLabel': 'string',
      //     '@type': 'bf:Note'},
      //    {...}]
      if (fieldLabel === 'Notes') {
        const note = getNote(props.bib);
        // Make sure we have at least one note
        if (note && Array.isArray(note)) {
          // Group notes by noteType:
          const notesGroupedByNoteType = note
            // Make sure all notes are blanknodes:
            .filter((note) => typeof note === 'object')
            .reduce((groups, note) => {
              const noteType = getNoteType(note);
              if (!groups[noteType]) groups[noteType] = [];
              groups[noteType].push(note);
              return groups;
            }, {});

          // For each group of notes, add a fieldToRender:
          Object.keys(notesGroupedByNoteType).forEach((noteType) => {
            const notesList = (
              <ul>
                {notesGroupedByNoteType[noteType].map((note, idx) => (
                  <li key={idx.toString()}>{note.prefLabel}</li>
                ))}
              </ul>
            );
            fieldsToRender.push({
              term: noteType,
              definition: notesList,
            });
          });
        }
      }

      if (
        fieldLabel === 'Electronic Resource' &&
        props.electronicResources.length
      ) {
        const electronicResources = props.electronicResources;
        let electronicElem;

        if (electronicResources.length === 1) {
          const electronicItem = electronicResources[0];
          electronicElem = (
            <a
              href={electronicItem.url}
              target="_blank"
              onClick={() =>
                trackDiscovery(
                  'Bib fields',
                  `Electronic Resource - ${electronicItem.label} - ${electronicItem.url}`,
                )
              }
              rel='noreferrer'
            >
              {electronicItem.label || electronicItem.url}
            </a>
          );
        } else {
          electronicElem = (
            <ul>
              {electronicResources.map((resource) => (
                <li key={resource.label}>
                  <a
                    href={resource.url}
                    target='_blank'
                    onClick={() =>
                      trackDiscovery(
                        'Bib fields',
                        `Electronic Resource - ${resource.label} - ${resource.url}`,
                      )
                    }
                    rel='noreferrer'
                  >
                    {resource.label || resource.url}
                  </a>
                </li>
              ))}
            </ul>
          );
        }

        fieldsToRender.push({
          term: fieldLabel,
          definition: electronicElem,
        });
      }
    }); // End of the forEach loop

    return fieldsToRender;
  }

  /**
   * compressSubjectLiteral(subjectLiteralArray)
   * Updates the string structure of subject literals.
   *
   * @param {array} subjectLiteralArray
   * @return {array}
   */
  const compressSubjectLiteral = (subjectLiteralArray) => {
    if (Array.isArray(subjectLiteralArray) && subjectLiteralArray.length) {
      subjectLiteralArray = subjectLiteralArray.map((item) =>
        item.replace(/\.$/, '').replace(/--/g, '>'),
      );
    }

    return subjectLiteralArray;
  }

  /**
   * constructSubjectHeading(bibValue, url, fieldValue, fieldLabel)
   * Constructs the link elements of subject headings.
   *
   * @param {string} bibValue - for constructing the texts of link elements
   * @param {string} url - for constructing the query values of the URLs
   * @param {string} fieldValue - offers the values of search keywords
   * @param {string} fieldLabel - offers the type of search keywords
   * @return {HTML element}
   */
  const constructSubjectHeading = (bibValue, url, fieldValue, fieldLabel) => {
    let currentArrayString = '';
    const filterQueryForSubjectHeading = 'filters[subjectLiteral]=';
    const singleSubjectHeadingArray = bibValue.split(' > ');
    const returnArray = [];

    const urlArray = url
      .replace(filterQueryForSubjectHeading, '')
      .split(' > ')
      .map((urlString, index) => {
        const dashDivided = index !== 0 ? ' -- ' : '';
        currentArrayString = `${currentArrayString}${dashDivided}${urlString}`;

        return currentArrayString;
      });

    singleSubjectHeadingArray.forEach((heading, index) => {
      const urlWithFilterQuery = `${filterQueryForSubjectHeading}${urlArray[index]}`;

      const subjectHeadingLink = (
        <Link
          onClick={(event) =>
            newSearch(
              event,
              urlWithFilterQuery,
              fieldValue,
              urlArray[index],
              fieldLabel,
            )
          }
          to={`${appConfig.baseUrl}/search?${urlWithFilterQuery}`}
          key={heading}
        >
          {heading}
        </Link>
      );

      returnArray.push(subjectHeadingLink);

      // Push a divider in between the link elements
      if (index < singleSubjectHeadingArray.length - 1) {
        returnArray.push(<span key={`divider-${index}`}> &gt; </span>);
      }
    });

    return returnArray;
  }

  /**
   * newSearch(e, query, field, value, label)
   * The method that passed as a callback to a Link element for handling onClick events.
   *
   * @param event {event} - onClick event
   * @param {string} query - the search query that is attached to the search endpoint
   * @param {string} field - the type of the search query
   * @param {string} value - the search keyword of the search. It will be used for the filter button
   * @param {string} label - the type of the search keyword. It will be used for
   * the search instruction
   */
  const newSearch = (event, query, field, value, label) =>{
    event.preventDefault();

    trackDiscovery('Bib fields', `${label} - ${value}`);
    router.push(`${appConfig.baseUrl}/search?${query}`);
  }

  // Make sure bib prop is
  //  1) nonempty
  //  2) an object
  //  3) not an array (which is also an object)
  if (
    _isEmpty(props.bib) ||
    !_isObject(props.bib) ||
    _isArray(props.bib)
  ) {
    return null;
  }
  // Make sure fields is a nonempty array:
  if (_isEmpty(props.fields) || !_isArray(props.fields)) {
    return null;
  }

  const bibDetails = getDisplayFields(props.bib);
  const data = combineBibDetailsData(bibDetails, props.additionalData || []);

  return (
    <DefinitionList
      data={data}
      headings={props.bib.subjectHeadingData}
    />
  );
};

BibDetails.propTypes = {
  bib: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
  electronicResources: PropTypes.array,
  additionalData: PropTypes.array,
};
BibDetails.defaultProps = {
  electronicResources: [],
  additionalData: [],
};

export default BibDetails;
