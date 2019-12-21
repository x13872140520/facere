import '@babel/polyfill'
import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import 'normalize.css'
import Vant from 'vant';
import 'vant/lib/index.css';
Vue.use(Vant);
require('./mock/usermock.js');
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

