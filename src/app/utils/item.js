import Locations from '../../../locations.js';
import LocationCodes from '../../../locationCodes.js';

function LibraryItem() {
  this.getDefaultLocation = () => ({
    '@id': 'loc:mal',
    prefLabel: 'Stephen A. Schwarzman Building - Rose Main Reading Room 315',
  });

  /**
   * getItem(record, itemId)
   *
   * @param {Object} record
   * @param {String} itemId
   * @return {Object}
   */
  this.getItem = (record, itemId) => {
    let thisItem = {};
    // look for item id in record's items
    const items = (record && record.items) ? record.items : null;

    if (items && itemId) {
      items.forEach((i) => {
        if (i['@id'] && i['@id'].substring(4) === itemId) {
          thisItem = i;
        }
      });
    }

    return thisItem;
  };

  /**
   * getItems(record)
   *
   * @param {Object} record
   * @return {Object}
   */
  this.getItems = (record) => {
    const recordTitle = record.title ? record.title[0] : '';
    // filter out anything without a status or location
    const rItems = record && record.items && record.items.length ? record.items : [];
    const items = rItems
      .filter((item) => item.status || item.electronicLocator)
      // map items
      .map((item) => {
        const id = item['@id'].substring(4);
        let status = item.status && item.status[0].prefLabel ? item.status[0].prefLabel : '';
        let availability = status.replace(/\W/g, '').toLowerCase();
        let accessMessage = item.accessMessage && item.accessMessage.length ? item.accessMessage[0].prefLabel.toLowerCase() : '';
        const callNumber = item.shelfMark && item.shelfMark.length ? item.shelfMark[0] : '';
        const locationDetails = this.getLocationDetails(item);
        let url = null;
        let actionLabel = null;
        let actionLabelHelper = null;
        let requestHold = false;
        const isElectronicResource = this.isElectronicResource(item);

        if (isElectronicResource && item.electronicLocator[0].url) {
          status = 'Available';
          availability = 'available';
          url = item.electronicLocator[0].url;
          actionLabel = 'View online';
          actionLabelHelper = `resource for ${recordTitle}`;
        } else if (accessMessage === 'adv request' && !item.holdingLocation) {
          requestHold = true;
          actionLabel = accessMessage;
          actionLabelHelper = 'request hold on ${recordTitle}';
        } else if (availability === 'available') {
          url = this.getLocationHoldUrl(locationDetails);
          actionLabel = 'Request for in-library use';
          actionLabelHelper = `for ${recordTitle} for use in library`;
        }

        return {
          id,
          status,
          availability,
          available: (availability === 'available'),
          accessMessage,
          isElectronicResource,
          location: locationDetails.prefLabel,
          callNumber,
          url,
          actionLabel,
          actionLabelHelper,
          requestHold,
        };
      });

    // sort: physical available items, then electronic resources, then everything else
    items.sort((a, b) => {
      let aAvailability = a.status === 'available' ? -1 : 1;
      let bAvailability = b.status === 'available' ? -1 : 1;
      if (a.isElectronicResource) aAvailability = 0;
      if (b.isElectronicResource) bAvailability = 0;
      return aAvailability - bAvailability;
    });

    return items;
  };

  this.getLocationHoldUrl = (location) => {
    const holdingLocationId = location['@id'].substring(4);
    let url = '';
    let shortLocation = 'schwarzman';

    if (holdingLocationId in LocationCodes) {
      shortLocation = LocationCodes[holdingLocationId].location;
    }

    switch (shortLocation) {
      case 'schwarzman':
        url = 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?&institution=13777&type=1&language=1';
        break;
      case 'lpa':
        url = 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?&institution=13252&type=1&language=1';
        break;
      case 'schomburg':
        url = 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?&institution=13810&type=1&language=1';
        break;
      case 'sibl':
        url = 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?&institution=13809&type=1&language=1';
        break;
      default:
        url = 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?&institution=13777&type=1&language=1';
        break;
    }

    return url;
  };

  /**
   * getLocation(record, itemId)
   *
   * @param {Object} record
   * @param {String} itemId
   * @return {Object}
   */
  this.getLocation = (record, itemId) => {
    const thisItem = this.getItem(record, itemId);

    // default to SASB - RMRR
    const defaultLocation = this.getDefaultLocation();

    // get location and location code
    let location = defaultLocation;
    if (thisItem && thisItem.location && thisItem.location.length > 0) {
      location = thisItem.location[0][0];
    }
    const locationCode = (location['@id'] && typeof location['@id'] === 'string') ? location['@id'].substring(4) : '';
    const prefLabel = (location) ? location.prefLabel : '';
    const isOffsite = (location) ? this.isOffsite(location) : false;

    // retrieve location data
    if (locationCode && locationCode in LocationCodes) {
      location = Locations[LocationCodes[locationCode].location];
    } else {
      location = Locations[LocationCodes[defaultLocation['@id'].substring(4)].location];
    }

    // retrieve delivery location
    let deliveryLocationCode = defaultLocation['@id'].substring(4);
    if (locationCode && locationCode in LocationCodes) {
      deliveryLocationCode = LocationCodes[locationCode].delivery_location || '';
    }

    location.offsite = isOffsite;
    location.code = deliveryLocationCode;
    location.prefLabel = prefLabel;

    if (isOffsite && deliveryLocationCode === defaultLocation['@id'].substring(4)) {
      location.prefLabel = defaultLocation.prefLabel;
    }

    return location;
  };

  this.getLocationDetails = (item) => {
    const defaultLocation = this.getDefaultLocation();
    let location = this.getDefaultLocation();

    // this is a physical resource
    if (item.holdingLocation && item.holdingLocation.length) {
      location = item.holdingLocation[0];
    // this is an electronic resource
    } else if (item.electronicLocator && item.electronicLocator.length) {
      location = item.electronicLocator[0];
      if (!location.prefLabel && location.label) {
        location.prefLabel = location.label;
      }
    }

    if (this.isOffsite(location)) {
      location.prefLabel = `${defaultLocation.prefLabel} (requested from offsite storage)`;
    }
    return location;
  };

  this.isElectronicResource = (item) => item.electronicLocator && item.electronicLocator.length;

  this.isOffsite = (location) => (
    location && location.prefLabel && location.prefLabel.substring(0, 7).toLowerCase() === 'offsite'
  );
}

export default new LibraryItem;
