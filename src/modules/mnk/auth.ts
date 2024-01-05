import mapValues from 'lodash/mapValues'
import chain from 'lodash/chain'
import { allTopics } from './topics'
import { getInternalLayers } from './util'

const allActions = ['view', 'query', 'update', 'insert', 'delete']
const queryActions = ['view', 'query']
const viewEditActions = ['view', 'edit']
const editActions = ['edit']
const viewActions = ['view']

const emptyArray = []

function createAdmin(options) {
  const internalLayers = getInternalLayers(options.project)

  const existingAuth = options.settings.auth?.roles?.find(
    (role) => role.name === 'Admin',
  )

  const result = {
    type: 'users',
    name: 'Admin',
    users: existingAuth?.users ?? [],
    permissions: {
      custom_media_upload: true,
      attributes: mapValues(options.project.meta.layers, (layer) => {
        const attributes = chain(layer.attributes)
          .keyBy('name')
          .mapValues((attr) =>
            attr.name === 'geom' ? emptyArray : viewEditActions,
          )
          .value()
        if (!attributes.geometry) {
          attributes.geometry = editActions
        }
        return attributes
      }),
      layers: mapValues(options.project.meta.layers, (layer) => {
        return allActions
      }),
      topics: allTopics,
    },
  }

  return result
}
function createAuthenticated(options) {
  const internalLayers = getInternalLayers(options.project)

  const result = {
    type: 'authenticated',
    name: 'Authenticated',
    users: [],
    permissions: {
      attributes: mapValues(options.project.meta.layers, (layer) => {
        let newActions = viewActions

        if (layer.name === 'webmap_issues') {
          newActions = viewEditActions
        } else if (layer.name.includes('webmap_photo_')) {
          newActions = viewEditActions
        }

        const attributes = chain(layer.attributes)
          .keyBy('name')
          .mapValues((attr) => (attr.name === 'geom' ? emptyArray : newActions))
          .value()

        if (!attributes.geometry) {
          attributes.geometry = emptyArray
        }
        return attributes
      }),

      layers: {
        ...mapValues(options.project.meta.layers, (layer) => {
          const isInternalLayer = internalLayers?.find((l) => l.id === layer.id)
          let newActions = queryActions
          if (isInternalLayer) {
            newActions = ['query']
          } else if (layer.name === 'webmap_issues') {
            newActions = ['view', 'query', 'insert']
          }

          return newActions
        }),
      },
      topics: allTopics,
    },
  }
  return result
}

function createOther(options) {
  const internalLayers = getInternalLayers(options.project)

  const result = {
    type: 'other',
    name: 'Other',
    users: [],

    permissions: {
      attributes: {
        ...mapValues(options.project.meta.layers, (layer) => {
          const attributes = chain(layer.attributes)
            .keyBy('name')
            .mapValues((attr) =>
              attr.name === 'geom' ? emptyArray : viewActions,
            )
            .value()
          if (!attributes.geometry) {
            attributes.geometry = emptyArray
          }
          return attributes
        }),
      },
      layers: mapValues(options.project.meta.layers, (layer) => {
        const isInternalLayer = internalLayers?.find((l) => l.id === layer.id)
        return queryActions
      }),
      topics: allTopics,
    },
  }

  return result
}

function createAuth(options) {
  return {
    type: 'public',
    roles: [
      createAdmin(options),
      createAuthenticated(options),
      createOther(options),
    ],
  }
}

export default createAuth
