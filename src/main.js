// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

require('@/assets/css/style.less')



new Vue({
  router,
  el: '#app',
  template:  `
  <div id="app">
  	<router-view></router-view>
  </div>
  `,
})

