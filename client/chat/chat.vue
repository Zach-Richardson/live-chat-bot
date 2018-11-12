<style>
.hovergrey:hover{
    background-color:#ddd;
    cursor: pointer;
}
.greybackground{
    background-color:#aaa;
    cursor: pointer;
}
.lightredbackground{
    background-color:rgb(192, 115, 115);
    cursor: pointer;
}
.hover-red:hover{
    color:rgb(184, 25, 25);
    cursor: pointer;
}
.flexbox {
    display: flex;
    flex: 1;
    margin-right:0.5em;
    width:100%;
}
.flashinggreen{
    cursor: pointer;
    -webkit-animation: flash-green-animation 2s linear 0s infinite; /* Safari 4.0 - 8.0 */
    animation: flash-green-animation 2s linear 0s infinite;
}
/* Safari */
@-webkit-keyframes flash-green-animation {
    0%   {background-color:#eee;}
    50%  {background-color:rgb(156, 180, 137);}
}
/* Non-Safari */
@keyframes flashing-green-animation {
    0%   {background-color:#eee;}
    50%  {background-color:rgb(156, 180, 137);}
}

.pull-right {
  float: right;
   margin-right: 0.25em;
}

.pull-bottom {
  float: bottom;
   margin-right: 0.25em;
}

</style>

<template lang="html">
    <div class="ui container left aligned">

        <div class="ui basic segment" style="padding-top:5%">
            <h2 class="ui header">
                Chat
            </h2>
        </div>
        
        <sui-grid>
            <sui-grid-row :cols="2">
                <sui-grid-column :width="6" style="padding-right:0px">

                    <sui-list divided relaxed style="overflow-x:hidden; overflow-y: scroll; height:650px">
                        <sui-list-item
                            v-for="thread in threads"
                            style="padding:3px"
                            :class="{
                                flashinggreen: !thread.seen, 
                                greybackground: selectedThread==thread,
                                lightredbackground: !thread.connected,
                                hovergrey: thread.seen&&selectedThread!=thread&&thread.connected
                            }">     
                            <sui-grid :columns="3">
                                <sui-grid-column :width="3" @click="select(thread)">
                                    <sui-grid-row>
                                        <sui-icon size="big" name="circle" />
                                    </sui-grid-row>
                                </sui-grid-column>
                                <sui-grid-column :width="8" @click="select(thread)">
                                    <sui-grid-row>
                                        <h4 style="margin-bottom:2px" v-text="thread.username"></h4>
                                        <span style="color:#777" v-text="thread.messages[thread.messages.length-1].text"></span>
                                    </sui-grid-row>
                                </sui-grid-column>
                                <sui-grid-column :width="5">
                                    <sui-grid-row>
                                        <sui-icon
                                            @click="archive(thread)"
                                            style="display:inline"
                                            color="grey"
                                            class="hover-red pull-right"
                                            name="archive"/>
                                    </sui-grid-row>
                                </sui-grid-column>
                            </sui-grid>                       
                        </sui-list-item>
                    </sui-list>

                </sui-grid-column>

                <sui-grid-column :width="10" style="padding-left:0px">

                    <sui-container >
                        <sui-list relaxed style="overflow-x:hidden; overflow-y: scroll; height:650px;" >
                            <sui-list-item v-for="message in selectedThread.messages" style="vertical-align:bottom">
                                <sui-grid :columns="3">
                                    <sui-grid-column :width="1">

                                    </sui-grid-column>
                                    <sui-grid-column :width="3">
                                        <sui-grid-row>
                                            <sui-icon size="large" name="circle" />
                                        </sui-grid-row>
                                    </sui-grid-column>
                                    <sui-grid-column :width="10">
                                        <sui-grid-row>
                                            <span v-text="message.text"></span><br />
                                            <span style="font-size:0.8em; color:#777" v-text="message.time"></span>
                                        </sui-grid-row>
                                    </sui-grid-column>
                                </sui-grid> 
                            </sui-list-item>
                        </sui-list>
                    </sui-container>
                    <div class="flexbox ui icon input">
                        <input 
                            @keyup.enter="sendMessage()" 
                            type="text" 
                            placeholder="Type your message..."
                            v-model="message">
                        <i 
                            @click="sendMessage()" 
                            class="paper plane outline link icon"></i>
                    </div>
                </sui-grid-column>
            </sui-grid-row>
        </sui-grid>

        

    </div>
</template>

<script>
'use strict'
const moment = require('moment');

module.exports = {
    data: () => ({ 
        global: shared.state,
        selectedThread: {
            messages: [],
        },
        message: '',
        threads: require('./mock.js').mockThreadData 
    }),
    methods: {
        select: function(thread) {
            this.selectedThread = thread;
            thread.seen = true;
        },
        archive: function(thread) {

        },
        sendMessage: function() {
            this.selectedThread.messages.push({
                text: this.message,
                time: moment().format('HH:MM:AM'),
            });
            this.message = '';
        }
    },
    mounted: function() {
        //load all non archived threads into thread array
    }
}       
</script>