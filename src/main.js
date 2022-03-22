// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
// antd组件按需加载
import './ant.js'
import 'ant-design-vue/dist/antd.css'
import router from './router'
import VueContextMenu from 'vue-contextmenu'
import vcolorpicker from 'vcolorpicker'
Vue.config.productionTip = false

Vue.use(VueContextMenu)
Vue.use(vcolorpicker)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
