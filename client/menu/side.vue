<style>
.lightgrey{
    cursor: pointer;
    color:#bbb;
}
.white{
    color:#fff;
}
i{
    cursor:pointer;
}
.item{
    cursor:pointer;
}
a:hover{
    color:white;
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

        <sui-grid>
            <sui-grid-row :columns="2">
                <sui-grid-column :width="6" style="padding:10px 0px 10px 10px">
                    <img class="logo" 
                        src="/static/images/forsta-logo-invert.svg" 
                        height="50px"
                        width="50px"
                        style="margin-left:20px"
                        @click="questions()">
                </sui-grid-column>
                <sui-grid-column style="padding-left:0px" :width="10">
                    <img src="/static/images/logo_just_text.svg" 
                        height="17px"
                        width="119px"
                        style="margin-top:20px"
                        @click="questions()"><br />
                    <h3
                        class="white"
                        style="margin-top:5px"
                        @click="questions()">Live Chat</h3>
                </sui-grid-column>
            </sui-grid-row>
        </sui-grid>

        <sui-list 
            divided 
            relaxed 
            size="huge" style="padding:7px; margin-top:50px">
            <sui-list-item @click="chat()" @mouseenter="hovering='chat'" @mouseleave="hovering=''">
                <sui-list-icon 
                    name="comments" 
                    size="large" 
                    vertical-align="middle"
                    :class="{
                        'white':currentRoute=='/chat'||hovering=='chat',
                        'lightgrey':!(currentRoute=='/chat'||hovering=='chat')}" /> 
                <sui-list-content  >
                    <a :class="{'white': currentRoute=='/chat'||hovering=='chat'}">Chat</a>
                </sui-list-content>
            </sui-list-item>
            <sui-list-item @click="archive()" @mouseenter="hovering='archive'" @mouseleave="hovering=''">
                <sui-list-icon 
                    name="archive" 
                    size="large" 
                    vertical-align="middle" 
                    :class="{
                        'white':currentRoute=='/archive'||hovering=='archive',
                        'lightgrey':!(currentRoute=='/archive'||hovering=='archive')}" /> 
                <sui-list-content>
                    <a :class="{'white': currentRoute=='/archive'||hovering=='archive'}">Archive</a>
                </sui-list-content>
            </sui-list-item>
            <sui-list-item @click="questions()" @mouseenter="hovering='questions'" @mouseleave="hovering=''">
                <sui-list-icon 
                    name="sitemap" 
                    size="large" 
                    vertical-align="middle" 
                    :class="{
                        'white':currentRoute=='/questions'||hovering=='questions',
                        'lightgrey':!(currentRoute=='/questions'||hovering=='questions')}" /> 
                <sui-list-content>
                    <a :class="{'white': currentRoute=='/questions'||hovering=='questions'}">Questions</a>
                </sui-list-content>
            </sui-list-item>
            <sui-list-item @click="businessInfo()" @mouseenter="hovering='businessInfo'" @mouseleave="hovering=''">
                <sui-list-icon 
                    name="clock" 
                    size="large" 
                    vertical-align="middle" 
                    :class="{
                        'white':currentRoute=='/businessInfo'||hovering=='businessInfo',
                        'lightgrey':!(currentRoute=='/businessInfo'||hovering=='businessInfo')}" /> 
                <sui-list-content>
                    <a :class="{'white': currentRoute=='/businessInfo'||hovering=='businessInfo'}">Business Info</a>
                </sui-list-content>
            </sui-list-item>
            <sui-list-item  @click="users()" @mouseenter="hovering='users'" @mouseleave="hovering=''">
                <sui-list-icon 
                    class="hover-white"  
                    name="user" 
                    size="large" 
                    vertical-align="middle" 
                    :class="{
                        'white':currentRoute=='/users'||hovering=='users',
                        'lightgrey':!(currentRoute=='/users'||hovering=='users')}" /> 
                <sui-list-content>
                    <a :class="{'white': currentRoute=='/users'||hovering=='users'}">Users</a>
                </sui-list-content>
            </sui-list-item>
            <sui-list-item  @click="groups()" @mouseenter="hovering='groups'" @mouseleave="hovering=''">
                <sui-list-icon 
                    class="hover-white"  
                    name="users" 
                    size="large" 
                    vertical-align="middle" 
                    :class="{
                        'white':currentRoute=='/groups'||hovering=='groups',
                        'lightgrey':!(currentRoute=='/groups'||hovering=='groups')}" /> 
                <sui-list-content>
                    <a :class="{'white': currentRoute=='/groups'||hovering=='groups'}">Groups</a>
                </sui-list-content>
            </sui-list-item>
            <sui-list-item 
                @click="showingSignOutModal = true"
                @mouseenter="hovering='signout'" @mouseleave="hovering=''">
                <sui-list-content>
                    <a :class="{'white': hovering=='signout'}">&nbsp;&nbsp;Sign Out</a>
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
        currentRoute: window.location.pathname,
        hovering: ''
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
        groups: function () {
            this.currentRoute = '/groups';
            this.$router.push({ name: 'groups' });
        },
        logout: function () {
            this.global.apiToken = null;
        },
    },
}
</script>