addEventListener('load', main);
function main() {
    const Vue = require('vue');
    const VueRouter = require('vue-router');
    const SuiVue = require('semantic-ui-vue');
    const VueMq = require('vue-mq');
    const VueSocketIO = require('vue-socket.io');
    Vue.use(VueRouter);
    Vue.use(SuiVue.default);
    Vue.use(VueMq, {
        breakpoints: {
            smallScreen: 1480,
            bigScreen: Infinity
        }
    });
    Vue.use(new VueSocketIO({
        debug: true,
        connection: 'http://localhost:4096/'
    }));

    const Root = require('./root.vue');
    const routes = [
        { path: '/welcome', name: 'welcome', component: require('./welcome/welcome.vue') },
        { path: '/auth/tag', name: 'loginTag', component: require('./auth/loginTag.vue') },
        { path: '/auth/code', name: 'loginCode', component: require('./auth/loginCode.vue') },
        { path: '/onboard/tag', name: 'onboardTag', component: require('./onboard/onboardTag.vue') },
        { path: '/onboard/auth/:type/:tag', name: 'onboardAuth', component: require('./onboard/onboardAuth.vue') },
        { path: '/users', name: 'users', component: require('./users/users.vue') },
        { path: '/groups', name: 'groups', component: require('./groups/groups.vue') },
        { path: '/questions', name: 'questions', component: require('./questions/questions.vue') },
        { path: '/chat', name: 'chat', component: require('./chat/chat.vue') },
        { path: '*', redirect: 'welcome' }
    ];

    const router = new VueRouter({
        mode: 'history',
        routes
    });

    new Vue({
        el: '#app',
        router,
        render: function (createElement) {
            return createElement(Root);
        }
    });
}