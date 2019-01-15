<style>
div [class*="pull left"] {
  float: left;
  margin-left: 0.25em;
}
div [class*="pull right"] {
  float: right;
   margin-right: 0.25em;
}
.flexbox {
    display: flex;
    flex: 1;
    margin-right:0.5em;
}
.color-picker input[type="color"] {
    height: 40px;
    width: 70px;
    vertical-align: middle;
}
.lightGrey{
    cursor: pointer;
    color:#A0A0A0;
}
.fullBlack{
    color:#000;
}
a:hover{
    cursor:pointer;
    color:#000;
}
</style>
 
<template lang="html">
    <div class="ui container left aligned">
        <sui-grid>
            <sui-grid-row>
                <sui-grid-column :width="4">
                    <sui-list 
                        divided 
                        relaxed
                        size="huge" style="padding:7px;position:fixed;width:15%;display:block">
                        <sui-list-item @click="selectPage('questions')" @mouseenter="hovering='questions'" @mouseleave="hovering=''">
                            <sui-list-icon 
                                name="comments" 
                                size="large" 
                                color="grey"
                                vertical-align="middle"
                                :class="{'black':selectedPage=='questions'||hovering=='questions'}" /> 
                            <sui-list-content>
                                <a 
                                    :class="{
                                        'fullBlack':selectedPage=='questions'||hovering=='questions',
                                        'lightGrey':selectedPage!='questions'&&hovering!='questions'}"  
                                    v-text="'Questions'"/>
                            </sui-list-content>
                        </sui-list-item>
                        <sui-list-item @click="selectPage('users')" @mouseenter="hovering='users'" @mouseleave="hovering=''">
                            <sui-list-icon 
                                name="user" 
                                size="large" 
                                color="grey"
                                vertical-align="middle"
                                :class="{'black':selectedPage=='users'||hovering=='users'}"  /> 
                            <sui-list-content  >
                                <a 
                                    :class="{
                                        'fullBlack':selectedPage=='users'||hovering=='users',
                                        'lightGrey':selectedPage!='users'&&hovering!='users'}" 
                                    v-text="'Users'"/>
                            </sui-list-content>
                        </sui-list-item>
                        <sui-list-item @click="selectPage('groups')" @mouseenter="hovering='groups'" @mouseleave="hovering=''">
                            <sui-list-icon 
                                name="users" 
                                size="large" 
                                color="grey"
                                vertical-align="middle"
                                :class="{'black':selectedPage=='groups'||hovering=='groups'}" /> 
                            <sui-list-content  >
                                <a 
                                    :class="{
                                        'fullBlack':selectedPage=='groups'||hovering=='groups',
                                        'lightGrey':selectedPage!='groups'&&hovering!='groups'}" 
                                    v-text="'Groups'"/>
                            </sui-list-content>
                        </sui-list-item>
                        
                    </sui-list>
                </sui-grid-column>
                <sui-grid-column :width="12">
                    <questions v-if="selectedPage=='questions'"/>
                    <users v-if="selectedPage=='users'" />
                    <groups v-if="selectedPage=='groups'" />
                </sui-grid-column>
            </sui-grid-row>
        </sui-grid>
    </div>
</template>
 
<script>
/* global (in root.vue): shared, util, focus, moment */
'use strict'
module.exports = {
    mounted: function() {
    },
    components: {
        questions: require('./questions.vue'),
        users: require('./users.vue'),
        groups: require('./groups.vue')
    },
    data: function() {
        return {
            global: shared.state,
            selectedPage: 'questions',
            hovering: ''
        }
    },
    methods: {
        selectPage: function(page){
            this.selectedPage = page;
        }
    }
}
</script>