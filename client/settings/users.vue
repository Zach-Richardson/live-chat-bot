
<style>
div.listgap {
    margin-bottom:3em!important;
}
.pull-left {
    float: left;
    margin-right: 0.25em;
}
.pull-right {
    float: right;
    margin-right: 0.25em;
}
.flexbox {
    display: flex;
    flex: 1;
    margin-right:0.5em;
    width:80%;
}
.userData{
    margin:20px 0px 20px 0px !important;
    padding-top:5%;
    border:1px solid #ddd;
    border-radius:5px
}
</style>

<template>
    <div class="ui main text container left aligned" style="margin-top: 80px;">
        <sui-grid>
            <sui-grid-row>
                <sui-button
                    content="New User"
                    color="green"
                    @click="showingNewUserModal = true" />
            </sui-grid-row>
            <sui-grid-row>
                <sui-grid-column :width="16">
                    <!-- Admin List -->
                    <sui-grid>
                        <sui-grid-row
                            style="margin-top:10px"
                            v-for="admin in admins" 
                            :key="admin.id"
                            class="userData">
                            <sui-grid-column :width="2">
                                <sui-list-icon 
                                    name="github" 
                                    size="big" 
                                    vertical-align="middle"/>
                            </sui-grid-column>
                            <sui-grid-column :width="12">
                                <h3>{{admin.first_name}} {{admin.last_name}}</h3>
                            </sui-grid-column>
                            <sui-grid-column :width="2">
                                <sui-button
                                    v-if="admin.id!=global.ourId"
                                    icon="trash"
                                    color="red"
                                    @click="removeAdmin(admin.id)"/>
                            </sui-grid-column>
                        </sui-grid-row>
                    </sui-grid>
                    <!-- /Admin List -->

                    <!-- New User Modal -->
                    <div>
                        <sui-modal v-model="showingNewUserModal" style="text-align:center">
                            <sui-modal-header>New User</sui-modal-header>
                            <sui-modal-content>
                                <sui-modal-description>
                                    <sui-header>Search for a user by tag:</sui-header>
                                    <!-- Search Input -->
                                    <span class="flexbox ui left icon input">
                                        <sui-icon
                                            name="at" />
                                        <input 
                                            @keyup.enter="searchUser()"
                                            v-model="newUserTag"
                                            style="border-radius:0px"
                                            type="text" 
                                            placeholder="Enter a user tag..." />
                                    </span>
                                    <div v-if="tagMessage" class="ui small message">{{tagMessage}}</div>
                                    <!-- /Search Input -->
                                    <!-- New User Info -->
                                    <div class="ui card" v-if="newUser">
                                        <div class="image">
                                            <object type="image/svg+xml" :data="newUserAvatarURL" />
                                            <!-- <img :src="'https://www.gravatar.com/avatar/'+newUser.gravatar_hash" /> -->
                                        </div>
                                        <div class="content">
                                            <a class="header">{{newUser.first_name}} {{newUser.last_name}}</a>
                                            <div class="meta">
                                            <span class="date">{{newUser.email}}</span>
                                            </div>
                                        </div>
                                        <div class="extra content">
                                            <a>
                                            <i class="user icon"></i>
                                            22 Friends
                                            </a>
                                        </div>
                                    </div>
                                    <!-- /New User Info -->
                                    <sui-button
                                        v-if="newUser" 
                                        class="green" 
                                        @click="addUser()"
                                        content="Add" />
                                </sui-modal-description>
                            </sui-modal-content>
                            <sui-modal-actions style="padding:10px;text-align:center">
                                <sui-button 
                                    class="green" 
                                    @click="showingNewUserModal=false"
                                    content="Close" />
                            </sui-modal-actions>
                        </sui-modal>
                    </div>
                    <!-- /New User Modal -->

                </sui-grid-column>
            </sui-grid-row>
        </sui-grid>
    </div>
</template>

<script>
const util = require('../util');
const REFRESH_POLL_RATE = 15000;

module.exports = {
    data: () => ({
        admins: [],
        newUser: null,
        newUserTag: '',
        newUserAvatarURL: '',
        tagMessage: '',
        global: shared.state,
        interval: null,
        groups: {},
        showingNewUserModal: false
    }),
    methods: {
        getAdmins: function() {
            util.fetch.call(this, '/api/auth/admins/v1')
            .then(result => {
                if (result.ok) {
                    console.log('admins : ');
                    console.log(result.theJson.administrators);
                    this.admins = result.theJson.administrators;
                }else{
                    console.log('error retrieving admin data from /api/auth/admins/v1');
                    console.log(result);
                }
            });
        },
        removeAdmin: function(id) {
            this.admins.splice(this.admins.indexOf(this.admins.find(a => a.id==id)), 1);
            let options = { method: 'post', body: { op: 'remove', id }};
            util.fetch.call(this, '/api/auth/admins/v1', options)
            .then(res => {
                if(res.ok){
                    this.admins = res.theJson;
                    this.newUserTag = '';
                    this.tagMessage = '';
                }else{
                    this.tagMessage = util.mergeErrors(res.theJson);
                }
            })
            .catch(err => console.log(err));
        },
        configAvatarURL: async function(sender, size){
            this.newUserAvatarURL = await util.getAvatarURL(sender, size);
        },
        searchUser: function() {
            this.newUser = null;
            this.newUserTag = '';
            const op = { method: 'get', headers: { userTag:this.newUserTag }};
            console.log(op);
            util.fetch.call(this, 'api/settings/user', op)
            .then(res => {
                if(res.ok){
                    this.newUser = res.theJson;
                    this.configAvatarURL(res.theJson, '50');
                }else{
                    this.tagMessage = util.mergeErrors(res.theJson);
                }
            });
        },
        addUser: function() {
            let options = { method: 'post', body: { op: 'add', tag: this.newUserTag }};
            util.fetch.call(this, '/api/auth/admins/v1', options)
            .then(res => {
                if(res.ok) {
                    console.log('res.theJson : ');
                    console.log(res.theJson);
                    this.newUser = res.theJson;
                    this.newUserTag = '';
                    this.tagMessage = 'User Found!';
                }else{
                    this.tagMessage = util.mergeErrors(res.theJson);
                }
            })
            .catch(err => console.log(err));
            this.admins.push(newUser);
            this.groups.find(group => group.name=='All').users.push(newUser);
            this.saveGroupData();
            this.newUser = null;
            this.newUserTag = '';
            this.showingNewUserModal = false;
        },
        loadGroups: async function(admin) {
            this.groups = (await util.fetch.call(this, '/api/settings/groups/')).theJson;
        },
        saveGroupData: function() {
            const options = {method:'post', body:{ groups:this.groups }};
            util.fetch.call(this, 'api/settings/groups', options);
        }
    },
    mounted: async function() {
        await this.getAdmins();
        await this.loadGroups();
        this.interval = setInterval(() => this.getAdmins(), REFRESH_POLL_RATE); 
    },
    beforeDestroy: function() {
        clearInterval(this.interval);
    }
}
</script>