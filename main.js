import Vue from 'vue';
import App from './App';
import http from './utils/request/request.js';
import store from './store/index.js';

Vue.config.productionTip = false
// 小程序中取不到值
App.mpType = 'app'
Vue.prototype.$store = store;
Vue.prototype.$http = http;

const app = new Vue({
    ...App,
})
app.$mount();
