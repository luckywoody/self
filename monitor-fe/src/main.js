import Vue from 'vue'
import App from './App.vue'
import r from './request.js'

Vue.config.productionTip = false
Vue.prototype.$http = r

new Vue({
  render: h => h(App),
}).$mount('#app')
