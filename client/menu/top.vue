<style>
div [class*="pull left"] {
  float: left;
  margin-left: 0.25em;
}
div [class*="pull right"] {
  float: right;
  margin-right: 0.25em;
}
a{
    color:#ddd;
}
a:hover{
    color:#aaa;
}
.hover-gray:hover{
    cursor: pointer;
    color:#ddd;
}
.header{
    color:white;
    display:inline;
    vertical-align:middle;
    margin-left:12px;
    cursor:pointer;
}

</style>

<template>
    <div>
     <div class="ui inverted menu" style="z-index: 1;">
        <div class="ui container">
            <img class="logo" 
                src="/static/images/forsta-logo-invert.svg" 
                height="35px"
                width="35px"
                style="margin:5px 5px 5px 0px;vertical-align:bottom">
            <img src="/static/images/logo_just_text.svg" 
                height="17px"
                width="119px"
                style="margin:15px 5px 5px 5px;vertical-align:bottom">
            <span style="margin:14px 5px 5px 10px;font-size:1.5em;color:white">
                Live Chat
            </span>
            <div 
                class="header item float right" 
                style="padding:0px;"
                v-if="global.apiToken">
                <div class="ui simple dropdown item" style="padding:3px">
                    <h5 style="margin:10px 5px 10px 5px;vertical-align:bottom" v-text="global.ourName"/>
                    <object v-if="avatarURL" style="cursor:pointer" type="image/svg+xml" :data="avatarURL" />
                    <div class="menu left">
                        <div class="item" @click="chat">
                            <i class="comment icon tiny"></i> Chat 
                        </div>
                        <div class="item" @click="settings">
                            <i class="cog icon tiny"></i> Settings 
                        </div>
                        <div class="item" @click="showingSignOutModal=true">
                            Sign Out
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
        <div>
            <sui-modal v-model="showingSignOutModal">
                <sui-modal-header>Sign Out</sui-modal-header>
                <sui-modal-content>
                    <sui-modal-description>
                        <sui-header>Are you sure you want to sign out?</sui-header>
                        <p>Any unsaved changes may be lost.</p>
                    </sui-modal-description>
                </sui-modal-content>
                <sui-modal-actions style="margin-bottom:20px;padding:10px">
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
        avatarURL: null
    }),
    methods: {
        chat: function () {
            this.$router.push({ name: 'chat' });
        },
        settings: function () {
            this.$router.push({ name: 'settings' });
        },
        logout: function () {
            this.global.apiToken = null;
            this.$router.push({ name: 'loginTag' })
        },
    },
    mounted: async function() {
        if(global.avatarURL){
            this.avatarURL = global.avatarURL;
            return;
        }
        const op = {type:'get', headers: {userId: this.global.userId} };
        const userData = (await util.fetch('/api/settings/user', op)).theJson;
        this.global.avatarURL = this.avatarURL = await util.getAvatarURL({
            gravatarHash: userData.gravatar_hash,
            name: `${userData.first_name} ${userData.last_name}`,
            id: userData.id
        }, '40');
        this.global.gravatarHash = userData.gravatar_hash;
        this.global.ourName = `${userData.first_name} ${userData.last_name}`;
    }
}
</script>