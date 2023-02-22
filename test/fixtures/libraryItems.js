// reflects item object after being parsed by `LibraryItem.mapItem`
const item = {
  full: {
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: true,
    barcode: '33433078478272',
    callNumber: 'JFE 07-5007 ---',
    format: 'Text',
    holdingLocationCode: 'loc:maj03',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: false,
    itemSource: 'sierra-nypl',
    location: 'SASB M1 - General Research - Room 315',
    materialType: {
      '@id': 'resourcetypes:txt',
      prefLabel: 'Text',
    },
    nonRecapNYPL: true,
    requestable: false,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
    volume: 'Vol. 1'
  },
  missingData: {
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: '',
    },
    availability: 'available',
    available: true,
    barcode: '33433078478272',
    callNumber: '',
    holdingLocationCode: '',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: false,
    itemSource: 'sierra-nypl',
    location: '',
    nonRecapNYPL: true,
    requestable: false,
    status: {
      '@id': 'status:a',
      prefLabel: '',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  requestable_ReCAP_available: {
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: true,
    barcode: '33433078478272',
    callNumber: 'JFE 07-5007 ---',
    holdingLocationCode: 'loc:rcaj03',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: true,
    itemSource: 'sierra-nypl',
    location: 'Offsite',
    nonRecapNYPL: false,
    requestable: true,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  requestable_ReCAP_not_available: {
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: false,
    barcode: '33433078478272',
    callNumber: 'JFE 07-5007 ---',
    holdingLocationCode: 'loc:rc2ma',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: true,
    itemSource: 'sierra-nypl',
    location: 'Offsite',
    nonRecapNYPL: false,
    requestable: true,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  requestable_nonReCAP_NYPL_schwarzman: {
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: true,
    barcode: '33433078478272',
    callNumber: 'JFE 07-5007 ---',
    holdingLocationCode: 'loc:maj03',
    branchEndpoint: 'schwarzman',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: false,
    itemSource: 'sierra-nypl',
    location: 'SASB M1 - General Research Room 315',
    nonRecapNYPL: true,
    requestable: true,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  requestable_nonReCAP_NYPL_lpa: {
    branchEndpoint: 'lpa',
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: true,
    barcode: '33433078478272',
    callNumber: 'JFE 07-5007 ---',
    holdingLocationCode: 'loc:maj03',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: false,
    itemSource: 'sierra-nypl',
    location: 'Performing Arts Research Collections - Theatre - Reference',
    nonRecapNYPL: true,
    requestable: true,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  requestable_nonReCAP_NYPL_schomburg: {
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: true,
    barcode: '33433078478272',
    branchEndpoint: 'schomburg',
    callNumber: 'JFE 07-5007 ---',
    holdingLocationCode: 'loc:maj03',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: false,
    itemSource: 'sierra-nypl',
    location: 'Schomburg Center - Research & Reference',
    nonRecapNYPL: true,
    requestable: true,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  requestable_nonReCAP_NYPL_not_available: {
    branchEndpoint: 'schwarzman',
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: false,
    barcode: '33433078478272',
    callNumber: 'JFE 07-5007 ---',
    dueDate: '1996-07-21',
    holdingLocationCode: 'loc:maj03',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: false,
    itemSource: 'sierra-nypl',
    location: 'SASB M1 - General Research - Room 315',
    nonRecapNYPL: true,
    requestable: true,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  requestable_nonReCAP_NYPL: {
    branchEndpoint: 'schwarzman',
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: true,
    barcode: '33433078478272',
    callNumber: 'JFE 07-5007 ---',
    holdingLocationCode: 'loc:maj03',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: false,
    itemSource: 'sierra-nypl',
    location: 'SASB M1 - General Research - Room 315',
    nonRecapNYPL: true,
    requestable: true,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  nonrequestable_nonReCAP_NYPL: {
    branchEndpoint: 'schwarzman',
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: true,
    barcode: '33433078478272',
    callNumber: 'JFE 07-5007 ---',
    holdingLocationCode: 'loc:maj03',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: false,
    itemSource: 'sierra-nypl',
    location: 'SASB M1 - General Research - Room 315',
    nonRecapNYPL: true,
    requestable: false,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  aeonRequestableWithoutParams: {
    id: 'i33299542',
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    availability: 'available',
    available: true,
    aeonUrl: 'https://specialcollections.nypl.org/aeon/Aeon.dll?Action=10&Form=30&Title=[Songs+and+piano+solos+/&Site=SCHMA&Author=Bechet,+Sidney,&Date=1941-1960.&ItemInfo3=https://nypl-sierra-test.nypl.org/record=b11545018x&ReferenceNumber=b11545018x&ItemInfo1=USE+IN+LIBRARY&Genre=Score&Location=Schomburg+Center&shelfmark=Sc Scores Bechet&itemid=33299542',
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'Use in library',
    },
    isElectronicResource: false,
    electronicResources: null,
    location: 'Schomburg Center - Manuscripts & Archives',
    locationUrl: 'http://www.nypl.org/locations/divisions/manuscripts-archives-and-rare-books-division',
    holdingLocationCode: 'loc:scdd2',
    callNumber: 'Sc Scores Bechet',
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?&institution=13777&type=1&language=1',
    requestable: false,
    suppressed: false,
    barcode: '45678',
    itemSource: 'sierra-nypl',
    isRecap: false,
    nonRecapNYPL: true,
    isOffsite: false,
    isSerial: false,
    format: 'Notated music',
    materialType: {
      '@id': 'resourcetypes:not',
      prefLabel: 'Notated music',
    },
    volume: '',
  },
  aeonRequestableWithParams: {
    id: 'i33299542',
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    availability: 'available',
    available: true,
    aeonUrl: 'https://specialcollections.nypl.org/aeon/Aeon.dll?Action=10&Form=30&Title=[Songs+and+piano+solos+/&Site=SCHMA&CallNumber=Sc+Scores+Bechet&Author=Bechet,+Sidney,&Date=1941-1960.&ItemInfo3=https://nypl-sierra-test.nypl.org/record=b11545018x&ReferenceNumber=b11545018x&ItemInfo1=USE+IN+LIBRARY&ItemISxN=i332995422&Genre=Score&Location=Schomburg+Center&shelfmark=Sc Scores Bechet&itemid=33299542&itemNumber=4567',
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'Use in library',
    },
    isElectronicResource: false,
    electronicResources: null,
    location: 'Schomburg Center - Manuscripts & Archives',
    locationUrl: 'http://www.nypl.org/locations/divisions/manuscripts-archives-and-rare-books-division',
    holdingLocationCode: 'loc:scdd2',
    callNumber: 'Sc Scores Bechet',
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?&institution=13777&type=1&language=1',
    requestable: false,
    suppressed: false,
    barcode: '45678',
    itemSource: 'sierra-nypl',
    isRecap: false,
    nonRecapNYPL: true,
    isOffsite: false,
    isSerial: false,
    format: 'Notated music',
    materialType: {
      '@id': 'resourcetypes:not',
      prefLabel: 'Notated music',
    },
    volume: '',
  },

};

export default item;
