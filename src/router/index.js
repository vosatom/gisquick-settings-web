import Vue from 'vue'
import VueRouter from 'vue-router'
import pick from 'lodash/pick'

// import TestView from '@/views/TestView.vue'
import TestView from '@/views/TestJsonDiff.vue'
import ProjectsView from '@/views/ProjectsView.vue'
import ProjectView from '@/views/ProjectView.vue'
import ProjectFiles from '@/views/ProjectFiles.vue'
import ProjectMap from '@/views/ProjectMap.vue'
import ProjectLayers from '@/views/ProjectLayers.vue'
import LayerAttributes from '@/views/LayerAttributes.vue'
import PublishView from '@/views/PublishView.vue'
import ProjectTopics from '@/views/ProjectTopics.vue'
import ProjectAccess from '@/views/ProjectAccess.vue'
import ProjectUpdate from '@/views/ProjectUpdate.vue'
import PluginView from '@/views/PluginView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/test',
    name: 'test',
    component: TestView
  },
  {
    path: '/',
    name: 'projects',
    component: ProjectsView
  },
  {
    path: '/publish',
    name: 'publish',
    component: PublishView,
    props: true
  },
  {
    path: '/plugin',
    name: 'plugin',
    component: PluginView,
    meta: { public: true }
  },
  {
    path: '/:user',
    name: 'user-projects',
    component: ProjectsView,
    props: true
  },
  {
    path: '/:user/:name/',
    name: 'project',
    props: true,
    // component: ProjectFiles,
    component: ProjectView,
    // redirect: { name: 'settings' },
    children: [
      {
        path: 'map',
        name: 'map',
        component: ProjectMap
      },
      {
        path: 'files',
        name: 'files',
        component: ProjectFiles
      },
      {
        path: 'layers',
        name: 'layers',
        component: ProjectLayers
      },
      {
        path: 'layers/attributes/:layerId',
        name: 'attributes',
        component: LayerAttributes,
        // props: true
        props: route => pick(route.params, ['layerId'])
      },
      {
        path: 'topics',
        name: 'topics',
        component: ProjectTopics
      },
      {
        path: 'access',
        name: 'access',
        component: ProjectAccess
      },
      {
        path: 'update',
        name: 'update',
        component: ProjectUpdate
      }
    ]
  }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
