import Vue from 'vue'

import { topics } from './topics'
import {
  bookmarks,
  description,
  extent,
  initial_extent,
  legendItems,
} from './content'
import createAuth from './auth'
import { storages } from './storages'
import { services } from './services'
import { getInternalLayers } from './util'

const defaultStorageProvider = 'local'

export function initTopics(options) {
  const layersList = Object.values(options.project.meta.layers)

  let newTopics = Object.values(topics).map((topic) => {
    const newTopic = { ...topic }
    const base_layer = layersList.find((l) => l.name === newTopic.base_layer)
    newTopic.base_layer = base_layer?.id
    newTopic.visible_overlays = newTopic.visible_overlays.map((layerName) => {
      const layer = layersList.find((l) => l.name === layerName)
      return layer?.id ?? layerName
    })
    return newTopic
  })

  Vue.set(options.settings, 'topics', newTopics)
}

export function initAuth(options) {
  Vue.set(options.settings, 'auth', createAuth(options))
  Vue.set(options.settings, 'base_layers', ['Base'])
}

export function initContent(options) {
  Vue.set(options.settings, 'description', description)
  Vue.set(options.settings, 'extent', extent)
  Vue.set(options.settings, 'initial_extent', initial_extent)
  Vue.set(options.settings, 'lang', 'cs-cz')

  const reportIssueLayerName = 'webmap_issues'
  const reportIssue =
    typeof Object.values(options.project.meta.layers).find(
      (l) => l.name === reportIssueLayerName,
    ) !== 'undefined'

  const customSettings = {
    tiled_overlay: true,
    show_embed: true,
  }

  if (reportIssue) {
    customSettings.report_issue = reportIssue
    customSettings.report_issue_layer_name = reportIssueLayerName
  }

  Vue.set(options.settings, 'custom', customSettings)
}

export function initServices(options) {
  Vue.set(options.settings, 'services', services)
  Vue.set(options.settings, 'storage', storages)
}

export function initLayers(options) {
  const internalLayers = getInternalLayers(options.project)

  Object.values(options.project.meta.layers).forEach((layer) => {
    if (
      layer.name?.indexOf('mnk_poi_') === 0 ||
      layer.name === 'webmap_issues'
    ) {
      Vue.set(
        options.settings.layers[layer.id],
        'infopanel_component',
        'PoiInfoPanel',
      )
      Vue.set(options.settings.layers[layer.id], 'custom', {
        ...options.settings.layers[layer.id]?.custom,
        legend_type: 'json',
      })

      Vue.set(
        options.settings.layers[layer.id],
        'attributes',

        {
          created_at: {
            widget: 'Autofill',
            config: {
              operations: ['insert'],
              value: 'current_datetime',
            },
          },
          last_modification: {
            widget: 'Autofill',
            config: {
              operations: ['update', 'insert'],
              value: 'current_datetime',
            },
          },
          author: {
            widget: 'Autofill',
            config: {
              operations: ['insert'],
              value: 'user',
            },
          },
          updated_by: {
            widget: 'Autofill',
            config: {
              operations: ['update', 'insert'],
              value: 'user',
            },
          },
        },
      )
    }

    if (layer.title?.includes('Černobílá')) {
      Vue.set(options.settings.layers[layer.id], 'filter', 'grayscale')
    }

    if (
      layer.title?.includes('Černobílá') ||
      layer.title?.includes('Městem na kole')
    ) {
      legendItems.nodes[0].title = layer.title
      Vue.set(options.settings.layers[layer.id], 'custom', {
        ...options.settings.layers[layer.id]?.custom,
        legend_type: 'table',
        legend_items: legendItems,
      })
    }

    if (layer.name?.includes('webmap_photo_')) {
      Vue.set(options.settings.layers[layer.id], 'attributes', {
        photo: {
          widget: 'MediaFile',
          config: {
            provider_id: defaultStorageProvider,
          },
        },
      })
    }

    const isInternalLayer = internalLayers?.find((l) => l.id === layer.id)
    if (isInternalLayer) {
      Vue.set(
        options.settings.layers[layer.id],
        'flags',
        options.settings.layers[layer.id]?.flags
          .filter((f) => f !== 'hidden')
          .concat('hidden') ?? [],
      )
    }
  })
}

export function initBookmarks(options) {
  const bookmarksSettings = { ...options.settings.bookmarks }
  Object.entries(options.project.meta.bookmarks).forEach(([groupId, group]) => {
    bookmarksSettings[groupId] = { ...bookmarksSettings[groupId] }
    Object.values(group).forEach((bookmark) => {
      const bookmarkConfig = bookmarks.find((b) => b.name === bookmark.name)
      if (bookmarkConfig?.content) {
        bookmarksSettings[groupId][bookmark.id] = {
          ...bookmarksSettings[groupId][bookmark.id],
          content: bookmarkConfig.content,
        }
      }
    })
  })

  Vue.set(options.settings, 'bookmarks', bookmarksSettings)
}
