import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/welcome",
      name: "welcome",
      component: () => import("./welcome/welcome.vue")
    },
    {
      path: "/auth/tag",
      name: "loginTag",
      component: () => import("./auth/loginTag.vue")
    },
    {
      path: "/auth/code",
      name: "loginCode",
      component: () => import("./auth/loginCode.vue")
    },
    {
      path: "/onboard/tag",
      name: "onboardTag",
      component: () => import("./onboard/onboardTag.vue")
    },
    {
      path: "/onboard/auth/:type/:tag",
      name: "onboardAuth",
      component: () => import("./onboard/onboardAuth.vue")
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("./settings/settings.vue")
    },
    {
      path: "/chat",
      name: "chat",
      component: () => import("./chat/chat.vue")
    }
  ]
});
