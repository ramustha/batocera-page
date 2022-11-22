import Vue, { createApp } from 'vue'
import App from './App.vue'
import { BootstrapVue, BootstrapVueIcons  } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import './assets/main.css'

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
createApp(App).mount('#app')
