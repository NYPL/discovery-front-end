import appConfig from "@appConfig";

// breakpoints ordered by `maxValue` ascending
const breakpoints = [
  {
    maxValue: 490,
    media: 'mobile',
  },
  {
    maxValue: 600,
    media: 'tabletPortrait',
  },
  {
    maxValue: 870,
    media: 'tablet',
  },
];

const itemFilters = [
  {
    type: 'location',
    retrieveOption: item => ({
      label: item.location,
      id: item.holdingLocationCode.startsWith('loc:rc') ? 'offsite' : item.holdingLocationCode,
    }),
  },
  {
    type: 'format',
    retrieveOption: item => ({
      label: item.format || '',
      id: item.format || '',
    }),
  },
  {
    type: 'status',
    retrieveOption: item => ({
      label: item.requestable ? 'Requestable' : item.status.prefLabel,
      id: item.requestable ? 'requestable' : item.status['@id'],
    }),
  },
];

const bibPageItemsListLimit = 20;
const searchResultItemsListLimit = 3;
const itemBatchSize = appConfig.itemBatchSize;

const noticePreferenceMapping = {
  'z': 'Email',
  'p': 'Telephone',
  '-': 'None',
};

const CLOSED_LOCATION_REGEX = /\(CLOSED\)|STAFF ONLY|SCHWARZMAN|Performing Arts|^[^a-z]+$/;

export {
  breakpoints,
  itemFilters,
  bibPageItemsListLimit,
  searchResultItemsListLimit,
  noticePreferenceMapping,
  CLOSED_LOCATION_REGEX,
  itemBatchSize,
};
