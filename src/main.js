import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import installElement from './plugins/element.js'
import MavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

const app = createApp(App)
app.use(router).use(MavonEditor)
installElement(app)
app.mount('#app')
