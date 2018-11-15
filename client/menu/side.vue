<style>
.header{
    color:#eee;
    display:inline;
    vertical-align:middle;
    margin-left:12px;
    cursor:pointer;
}
.hoverwhite{
    cursor: pointer;
    color:#bbb;
}
.hoverwhite:hover{
    cursor: pointer;
    color:#fff;
}
.white{
    color:#fff;
}
.white:hover{
    color:#fff;
}
</style>

<template>
    <div>
    <sui-sidebar
        style="background-color:#202122"
        animation="slide out"
        direction="left"
        visible
        width="very wide">

        <div style="padding:10px"></div>

        <div style="padding:10px">
            <img 
                class="logo" 
                src="/static/images/forsta-logo-invert.svg" 
                height="50px"
                width="50px"
                @click="questions()">
            <h3 
                class="header"
                @click="questions()">&nbsp;&nbsp;Forsta Live Chat</h3>
        </div>
        
        <sui-list 
            divided 
            relaxed 
            size="huge" style="padding:7px; margin-top:50px">
            <sui-list-item @click="chat()">
                <sui-list-icon 
                    name="comments" 
                    size="large" 
                    vertical-align="middle"
                    :class="{
                        'white': currentRoute=='/chat', 
                        'hoverwhite': currentRoute!='/chat'}" />
                <sui-list-content  >
                    <a :class="{
                        'white': currentRoute=='/chat', 
                        'hoverwhite': currentRoute!='/chat'}">Chat</a>
                </sui-list-content>
            </sui-list-item>
            <sui-list-item @click="archive()">
                <sui-list-icon 
                    name="archive" 
                    size="large" 
                    vertical-align="middle" 
                    :class="{
                        'white': currentRoute=='/archive', 
                        'hoverwhite': currentRoute!='/archive'}"/>
                <sui-list-content>
                    <a :class="{
                        'white': currentRoute=='/archive', 
                        'hoverwhite': currentRoute!='/archive'}">Archive</a>
                </sui-list-content>
            </sui-list-item>
            <sui-list-item @click="questions()">
                <sui-list-icon 
                    name="sitemap" 
                    size="large" 
                    vertical-align="middle" 
                    :class="{
                        'white': currentRoute=='/questions', 
                        'hoverwhite': currentRoute!='/questions'}"/>
                <sui-list-content>
                    <a :class="{
                        'white': currentRoute=='/questions', 
                        'hoverwhite': currentRoute!='/questions'}">Questions</a>
                </sui-list-content>
            </sui-list-item>
            <sui-list-item @click="businessInfo()">
                <sui-list-icon 
                    name="clock" 
                    size="large" 
                    vertical-align="middle" 
                    :class="{
                        'white': currentRoute=='/businessInfo',
                        'hoverwhite': currentRoute!='/businessInfo'}"/>
                <sui-list-content>
                    <a :class="{
                        'white': currentRoute=='/businessInfo', 
                        'hoverwhite': currentRoute!='/businessInfo'}">Business Info</a>
                </sui-list-content>
            </sui-list-item>
            <sui-list-item  @click="users()">
                <sui-list-icon 
                    class="hover-white"  
                    name="user" 
                    size="large" 
                    vertical-align="middle" 
                    :class="{
                        'white': currentRoute=='/users', 
                        'hoverwhite': currentRoute!='/users'}"/>
                <sui-list-content>
                    <a :class="{
                        'white': currentRoute=='/users', 
                        'hoverwhite': currentRoute!='/users'}">Users</a>
                </sui-list-content>
            </sui-list-item>
            <sui-list-item @click="showingSignOutModal = true">
                <sui-list-content>
                    <a :class="{
                        'white': currentRoute=='/businessInfo', 
                        'hoverwhite': currentRoute!='/businessInfo'}">&nbsp;&nbsp;Sign Out</a>
                </sui-list-content>
            </sui-list-item>
        </sui-list>
    </sui-sidebar>

    <div>
        <sui-modal v-model="showingSignOutModal">
            <sui-modal-header>Sign Out</sui-modal-header>
            <sui-modal-content>
                <sui-modal-description>
                    <sui-header>Are you sure you want to sign out?</sui-header>
                    <p>Any unsaved changes may be lost.</p>
                </sui-modal-description>
            </sui-modal-content>
            <sui-modal-actions style="padding:10px">
                <sui-button 
                    class="yellow" 
                    floated="left"
                    @click="showingSignOutModal = false"
                    content="Cancel" />
                <sui-button 
                    floated="right" 
                    class="green" 
                    @click="logout()"
                    content="Sign Out" />
            </sui-modal-actions>
        </sui-modal>
    </div>
    </div>
</template>

<script>
shared = require('../globalState');

module.exports = {
    data: () => ({ 
        global: shared.state,
        loggedIn: false,
        showingSignOutModal: false,
        currentRoute: window.location.pathname
    }),
    methods: {        
        chat: function () {
            this.currentRoute = '/chat';
            this.$router.push({ name: 'chat' });
        },
        archive: function () {
            this.currentRoute = '/archive';
            this.$router.push({ name: 'archive' });
        },
        questions: function () {
            this.currentRoute = '/questions';
            this.$router.push({ name: 'questions' });
        },
        businessInfo: function () {
            this.currentRoute = '/businessInfo';
            this.$router.push({ name: 'businessInfo' });
        },
        users: function () {
            this.currentRoute = '/users';
            this.$router.push({ name: 'users' });
        },
        logout: function () {
            this.global.apiToken = null;
        },
    },
    mounted: function() {
        console.log('this.currentRoute');
        console.log(this.currentRoute);
    }
}
</script>