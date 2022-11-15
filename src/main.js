import Vue, { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { BootstrapVue } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import './assets/main.css'

Vue.use(BootstrapVue);

const app = createApp(App)
app.use(router)
app.mount('#app')
