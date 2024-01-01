export const services = {
  providers: {
    graphhopper: {
      id: 'graphhopper',
      type: 'graphhopper',
      label: 'Graphhopper',
      settings: {
        baseUrl: '',
        locale: 'cs',
        profiles: [
          {
            id: 'bike',
            label: 'Bike',
          },
        ],
      },
    },
    here: {
      id: 'here',
      type: 'here',
      label: 'Here',
      settings: {
        key: '',
        locale: 'cs',
      },
    },
    geoapify: {
      id: 'geoapify',
      type: 'geoapify',
      label: 'Geoapify',
      settings: {
        baseUrl: 'https://api.geoapify.com/v1',
        key: '',
        locale: 'cs',
      },
    },
    cyclestreets: {
      id: 'cyclestreets',
      type: 'cyclestreets',
      label: 'Cyclestreets',
      settings: {
        baseUrl: 'https://www.cyclestreets.net',
        key: '',
        locale: 'cs',
      },
    },
    osrm: {
      id: 'osrm',
      type: 'osrm',
      label: 'OSRM',
      settings: {
        baseUrl: 'https://routing.openstreetmap.de',
        locale: 'cs',
        profiles: [
          {
            id: 'car',
            label: 'Car',
          },
          {
            id: 'bike',
            label: 'Bike',
          },
          {
            id: 'foot',
            label: 'Walk',
          },
        ],
      },
    },
    nominatim: {
      id: 'nominatim',
      type: 'nominatim',
      label: 'Nominatim',
      settings: {},
    },
    photon: {
      id: 'photon',
      type: 'photon',
      label: 'Photon',
      settings: {},
    },
    valhalla: {
      id: 'valhalla',
      type: 'valhalla',
      label: 'Valhalla',
      settings: {
        profiles: [
          {
            id: 'auto',
            label: 'Car',
          },
          {
            id: 'bicycle',
            label: 'Bike',
          },
          {
            id: 'pedestrian',
            label: 'Walk',
          },
        ],
      },
    },
    wfs: {
      id: 'wfs',
      type: 'wfs',
      label: 'Project',
      settings: { baseUrl: '/api/map/ows/automat/mnk', layers: {} },
    },
    arcgis: {
      id: 'arcgis',
      type: 'arcgis',
      label: 'Arcgis',
      settings: {},
    },
    cusdis: {
      id: 'cusdis',
      type: 'cusdis',
      label: 'Comments',
      settings: {
        baseUrl: '',
        appId: '',
        locale: 'cs',
      },
    },
  },

  features: {
    route: {
      id: 'route',
      provider: 'cyclestreets',
      enabled: true,
      settings: {
        alternatives: true,
        autoUpdate: true,
        elevation: true,
        // details: ['road_class', 'road_environment', 'max_speed', 'average_speed'],
        details: [
          // 'country',
          // 'max_weight',
          // 'max_width',
          // 'toll',
          // 'hazmat',
          // 'hazmat_tunnel',
          // 'hazmat_water',
          // 'lanes',
          // 'surface',
          // 'hike_rating',
          // 'mtb_rating',
          // 'foot_network',
          // 'street_name',
          // 'street_ref',
          // 'street_destination',
          // 'roundabout',
          // 'time',
          // 'distance',
          // 'max_speed',
          // 'road_class',
          // 'road_class_link',
          // 'road_access',
          // 'road_environment',
          // 'smoothness',
          // 'bike_network',
          // 'get_off_bike',
        ],
        // details: [],
        // profiles: [],
        instructions: true,
        instructionsSigns: true,
        defaultProfile: 'bike',
        maxPoints: 0,
      },
    },
    autocomplete: {
      id: 'autocomplete',
      provider: 'here',
      enabled: true,
      settings: {
        autoUpdate: true,
        biasToMapView: true,
      },
    },
    search: {
      id: 'search',
      provider: ['here'],
      enabled: true,
      settings: {
        autoUpdate: true,
        biasToMapView: true,
      },
    },

    isoline: {
      id: 'isoline',
      enabled: false,
      settings: { autoUpdate: true, distance: true, time: true, profiles: [] },
    },
    geocode: { id: 'geocode', provider: 'here', enabled: true, settings: null },
    reverseGeocode: {
      id: 'reverseGeocode',
      provider: 'here',
      enabled: true,
      settings: {},
    },
    mapMatch: {
      id: 'mapMatch',
      provider: 'graphhopper',
      enabled: true,
      settings: { profiles: [], details: [] },
    },

    comments: {
      id: 'comments',
      provider: 'cusdis',
      enabled: true,
      settings: {},
    },
  },
}
