
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
</style>

<template>
    <div class="ui main text container left aligned" style="margin-top: 80px;">
        <sui-grid>
            <sui-grid-row>
                <sui-grid-column :width="16">
                    <!-- Group List -->
                    <sui-grid style="margin-top: 40px;">
                        <sui-grid-row v-for="group in groups" :key="group.name">
                            <sui-grid-column :width="2">
                                <sui-list-icon 
                                    name="circle" 
                                    size="large" 
                                    vertical-align="middle"/>
                            </sui-grid-column>
                            <sui-grid-column :width="12">
                                <h3 v-text="group.name"></h3>
                                <sui-grid style="margin:10px">
                                    <sui-grid-row v-for="admin in group.users" :key="admin.id">
                                        <sui-grid-column :width="10">
                                            <h5>{{admin.first_name}} {{admin.last_name}}</h5>
                                        </sui-grid-column>
                                        <sui-grid-column :width="6">
                                            <sui-dropdown text="Change Group">
                                                <sui-dropdown-menu>
                                                    <sui-dropdown-item 
                                                        v-for="group in groups" 
                                                        :key="group.name"
                                                        v-text="group.name"
                                                        @click="addToGroup(group, admin)"></sui-dropdown-item>
                                                </sui-dropdown-menu>
                                            </sui-dropdown>
                                        </sui-grid-column>
                                    </sui-grid-row>
                                </sui-grid>
                            </sui-grid-column>
                            <sui-grid-column :width="2">
                                <sui-button 
                                    v-if="group.name!='All'"
                                    icon="trash"
                                    color="red"
                                    @click="deleteGroup(group)"/>
                            </sui-grid-column>
                        </sui-grid-row>
                    </sui-grid>
                    <!-- /Group List -->

                </sui-grid-column>
            </sui-grid-row>
            <sui-grid-row>
                <sui-button
                    content="New Group"
                    color="green"
                    @click="showingNewGroupModal = true" />
            </sui-grid-row>
        </sui-grid>

        <!-- New Group Modal -->
        <div>
            <sui-modal v-model="showingNewGroupModal">
                <sui-modal-header>New Group</sui-modal-header>
                <sui-modal-content>
                    <sui-modal-description>
                        <sui-header>Enter a name for the new group:</sui-header>
                        <sui-input v-model="newGroupName" @keyup.enter="createNewGroup()"/>
                    </sui-modal-description>
                </sui-modal-content>
                <sui-modal-actions style="padding:10px;text-align:center">
                    <sui-button 
                        class="green" 
                        @click="createNewGroup()"
                        content="Create" />
                </sui-modal-actions>
            </sui-modal>
        </div>
        <!-- /New Group Modal -->
    </div>
</template>

<script>
const util = require('../util');
const REFRESH_POLL_RATE = 15000;

module.exports = {
    data: () => ({
        admins: [],
        newAdminTag: '',
        tagError: '',
        global: shared.state,
        interval: null,
        groups: [],
        showingNewGroupModal: false,
        newGroupName: ''
    }),
    methods: {
        getAdmins: async function() {
            util.fetch.call(this, '/api/auth/admins/v1')
            .then(result => {
                if (result.ok) {
                    console.log(result.theJson.administrators);
                    this.admins = result.theJson.administrators;
                }else{
                    console.log('error retrieving admin data from /api/auth/admins/v1');
                    console.log(result);
                }
            });
        },
        loadGroups: async function() {
            util.fetch.call(this, '/api/settings/groups')
            .then( res => {
                this.groups = res.theJson;
            });
        },
        deleteGroup: function(group) {
            if(group.name == 'All'){
                return;
            }
            let defaultGroup = this.groups.find(group => group.name=='All');
            group.users.forEach(user => {
                defaultGroup.users.push(user);
            });
            this.groups.splice(this.groups.indexOf(group), 1);
            this.saveGroupData();
        },
        addToGroup: function(group, admin) {
            this.groups.forEach(group => {
                if(group.users.indexOf(admin)!=-1){
                    group.users.splice(group.users.indexOf(admin), 1);
                }
            });
            this.groups[this.groups.indexOf(group)].users.push(admin);
            this.saveGroupData();
        },
        getGroupUsers: function(groupKey) {
            return this.groups[groupKey];
        },
        createNewGroup: function() {
            this.groups.push({name: this.newGroupName, users: []});
            this.saveGroupData();
            this.showingNewGroupModal = false;
        },
        saveGroupData: function() {
            const options = {method:'post', body:{groups:this.groups}};
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