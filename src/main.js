import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
//添加element-ui样式
import "element-ui/lib/theme-chalk/index.css";
//按需导入
import './plugins/element.js'
//导入全局样式表
import './assets/css/global.css'
//导入字体图标
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)

import {requestGet} from './utils/api'
import {requestQuickGet} from './utils/api'
import {requestPostForm} from './utils/api'
import {requestPostLogin} from './utils/api'
import {requestPut} from './utils/api'
import {requestDelete} from './utils/api'

Vue.config.productionTip = false

Vue.prototype.requestGet = requestGet;
Vue.prototype.requestQuickGet = requestQuickGet;
Vue.prototype.requestPostForm = requestPostForm;
Vue.prototype.requestPostLogin = requestPostLogin;
Vue.prototype.requestPut = requestPut;
Vue.prototype.requestDelete = requestDelete;

Vue.component('tree-table',TreeTable)

Vue.filter('dateFormat',function(originVal){
    const dt=new Date(originVal);
    
    const y=dt.getFullYear();
    const m=(dt.getMonth()+1+'').padStart(2,'0');
    const d=(dt.getDate()+'').padStart(2,'0');

    const hh=(dt.getHours()+'').padStart(2,'0');
    const mm=(dt.getMinutes()+'').padStart(2,'0');
    const ss=(dt.getSeconds()+'').padStart(2,'0');

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
})

import {isNullOrBlank} from './utils/utils'
Vue.prototype.isNullOrBlank = isNullOrBlank;

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
