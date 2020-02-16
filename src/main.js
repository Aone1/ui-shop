import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'  //单独引入样式文件
//导入全局样式表
import './assets/css/global.css'
//导入字体图标
import './assets/fonts/iconfont.css'

import {requestGet} from './utils/api'
import {requestQuickGet} from './utils/api'
import {requestPostForm} from './utils/api'
import {requestPostLogin} from './utils/api'
import {requestPut} from './utils/api'
import {requestDelete} from './utils/api'

Vue.config.productionTip = false
Vue.use(ElementUI)

Vue.prototype.requestGet = requestGet;
Vue.prototype.requestQuickGet = requestQuickGet;
Vue.prototype.requestPostForm = requestPostForm;
Vue.prototype.requestPostLogin = requestPostLogin;
Vue.prototype.requestPut = requestPut;
Vue.prototype.requestDelete = requestDelete;

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
