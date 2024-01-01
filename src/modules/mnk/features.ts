export const defaultFeaturesSettings = {
  route: {
    id: 'route',
    provider: null,
    enabled: false,
    settings: {
      alternatives: true,
      autoUpdate: true,
      elevation: true,
      details: [],
      instructions: true,
      instructionsSigns: true,
      defaultProfile: 'bike',
      maxPoints: 0,
    },
  },
  autocomplete: {
    id: 'autocomplete',
    provider: null,
    enabled: false,
    settings: {
      autoUpdate: true,
      biasToMapView: true,
    },
  },
  search: {
    id: 'search',
    provider: [],
    enabled: false,
    settings: {
      autoUpdate: true,
      biasToMapView: true,
    },
  },

  isoline: {
    id: 'isoline',
    provider: null,
    enabled: false,
    settings: { autoUpdate: true, distance: true, time: true, profiles: [] },
  },
  geocode: { id: 'geocode', provider: null, enabled: false },
  reverseGeocode: {
    id: 'reverseGeocode',
    provider: null,
    enabled: false,
    settings: {},
  },
  mapMatch: {
    id: 'mapMatch',
    provider: null,
    enabled: false,
    settings: { profiles: [], details: [] },
  },

  comments: {
    id: 'comments',
    provider: null,
    enabled: false,
    settings: {},
  },
}
