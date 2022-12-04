import Vue from 'vue'
import Router from 'vue-router'
import FlowDesign from '@/components/flow-design/Index'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'FlowDesign',
      component: FlowDesign
    }
  ]
})
