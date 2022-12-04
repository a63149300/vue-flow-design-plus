// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueContextMenu from 'vue-contextmenu'
import vcolorpicker from 'vcolorpicker'
import Storage from 'vue-lsp'
import App from './App'
// antd组件按需加载
import './ant.js'
import 'ant-design-vue/dist/antd.css'
import router from './router'
import '@/components/flow-design/assets/style/index.less'

const options = {
  namespace: 'flow__', // key prefix
  name: 'ls', // name variable Vue.[ls] or this.[$ls],
  storage: 'local' // storage name session, local, memory
}

Vue.config.productionTip = false

Vue.use(VueContextMenu)
Vue.use(vcolorpicker)
Vue.use(Storage, options)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
