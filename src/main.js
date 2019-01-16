import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "semantic-ui-css/semantic.min.css";
import SuiVue from "semantic-ui-vue";
import VueSocketIO from "vue-socket.io";

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount("#app");
Vue.use(SuiVue);
Vue.use(
  new VueSocketIO({
    debug: true,
    connection: "http://localhost:4096/"
  })
);
