
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
                    <!-- Search Input -->
                    <span class="flexbox ui left icon input">
                        <sui-icon
                            name="at" />
                        <input 
                            @keyup.enter="addAdmin()"
                            v-model="newAdminTag"
                            style="border-radius:0px"
                            type="text" 
                            placeholder="Enter a user tag..." />
                    </span>
                    <div v-if="tagError" class="ui small error message">{{tagError}}</div>
                    <!-- /Search Input -->

                    <!-- Admin List -->
                    <sui-grid style="margin-top: 40px;">
                        <sui-grid-row v-for="admin in admins" :key="admin.id">
                            <sui-grid-column :width="2">
                                <sui-list-icon 
                                    name="github" 
                                    size="big" 
                                    vertical-align="middle"/>
                            </sui-grid-column>
                            <sui-grid-column :width="12">
                                <h3 v-text="admin.label"></h3>
                            </sui-grid-column>
                            <sui-grid-column :width="2">
                                <sui-button 
                                    icon="trash"
                                    color="red"
                                    @click="removeAdmin(admin.id)"/>
                            </sui-grid-column>
                        </sui-grid-row>
                    </sui-grid>
                    <!-- /Admin List -->

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
        newAdminTag: '',
        tagError: '',
        global: shared.state,
        interval: null,
        groups: {}
    }),
    methods: {
        getAdmins: function() {
            util.fetch.call(this, '/api/auth/admins/v1')
            .then(result => {
                if (result.ok) {
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
                    this.newAdminTag = '';
                    this.tagError = '';
                }else{
                    this.tagError = util.mergeErrors(res.theJson);
                }
            })
            .catch(err => console.log(err));
        },
        addAdmin: function() {
            let options = { method: 'post', body: { op: 'add', tag: this.newAdminTag }};
            util.fetch.call(this, '/api/auth/admins/v1', options)
            .then(res => {
                if(res.ok) {
                    const newAdmin = res.theJson;
                    this.admins.push(newAdmin);
                    this.newAdminTag = '';
                    this.tagError = '';
                    console.log('this.groups.find(group => group.name==Default)');
                    console.log(this.groups.find(group => group.name=='Default'));
                    console.log('newAdmin : ');
                    console.log(newAdmin);
                    this.groups.find(group => group.name=='Default').users.push(newAdmin);
                    this.saveGroupData();
                }else{
                    this.tagError = util.mergeErrors(res.theJson);
                }
            })
            .catch(err => console.log(err));
            
        },
        loadGroups: async function(admin) {
            this.groups = (await util.fetch.call(this, '/api/groups/')).theJson;
            console.log('this.groups : ');
            console.log(this.groups);
        },
        saveGroupData: function() {
            const options = {method:'post', body:{groups:this.groups}};
            util.fetch.call(this, 'api/groups', options);
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