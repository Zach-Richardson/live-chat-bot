<style>
.hovergrey:hover{
    background-color:#ddd;
    cursor: pointer;
}
.hoverblue:hover{
    background-color:#0088CB;
    cursor:pointer;
}
.bluebackground{
    background-color:#0088CB;
    cursor:pointer;
}
.greybackground{
    background-color:#aaa;
    cursor: pointer;
}
.lightredbackground{
    background-color:#F11734;
    cursor: pointer;
}
.message-bubble-link{
    color:#2E85C5;
    font-weight:1.2em;
}
.message-bubble-link:hover{
    color:rgb(35, 107, 158);
    font-weight:1.4em;
}
.hover-red:hover{
    color:#E72133;
    cursor: pointer;
}
.flexbox {
    display: flex;
    flex: 1;
    margin-right:0.5em;
    width:100%;
}
.flashingblue{
    cursor: pointer;
    -webkit-animation: flash-green-animation 2s linear 0s infinite; /* Safari 4.0 - 8.0 */
    animation: flash-green-animation 2s linear 0s infinite;
}
/* Safari */
@-webkit-keyframes flash-green-animation {
    0%   {background-color:#fafafa;}
    50%  {background-color:#0088CB}
}
/* Non-Safari */
@keyframes flashing-green-animation {
    0%   {background-color:#fafafa;}
    50%  {background-color:#0088CB;}
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
                                flashingblue: !thread.seen, 
                                bluebackground: selectedThread==thread,
                                lightredbackground: !thread.connected,
                                hoverblue: thread.seen&&selectedThread!=thread&&thread.connected
                            }">     
                            <sui-grid :columns="3">
                                <sui-grid-column :width="3" @click="select(thread)">
                                    <sui-grid-row>
                                        <sui-icon size="huge" name="circle" />
                                    </sui-grid-row>
                                </sui-grid-column>
                                <sui-grid-column :width="8" @click="select(thread)">
                                    <sui-grid-row>
                                        <h4 style="margin-bottom:2px" v-text="thread.username"></h4>
                                        <span 
                                            style="color:#afafaf" 
                                            v-text="newestMessage(thread)">
                                        </span>
                                    </sui-grid-row>
                                </sui-grid-column>
                                <sui-grid-column :width="5">
                                    <sui-grid-row>
                                        <sui-icon
                                            @click="archive(thread)"
                                            style="display:inline"
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
                        <sui-list relaxed style="overflow-x:hidden; overflow-y: scroll; height:612px;" >
                            <sui-list-item v-for="message in selectedThread.messages">
                                <sui-grid :columns="3">
                                    <sui-grid-column :width="1"></sui-grid-column>
                                    <sui-grid-column :width="1">
                                        <sui-grid-row>
                                            <sui-icon size="big" name="circle" />
                                        </sui-grid-row>
                                    </sui-grid-column>
                                    <sui-grid-column :class="{
                                            'five wide':(message.text.length<30),
                                            'six wide':(message.text.length>=30),
                                            'seven wide':(message.text.length>=40),
                                            'eight wide':(message.text.length>=50),
                                            'nine wide':(message.text.length>=60),
                                            'ten wide':(message.text.length>=70),
                                            'eleven wide':(message.text.length>=80),
                                            'twelve wide':(message.text.length>=90),
                                        }">
                                        <sui-grid-row>
                                            <div style="padding:7px" class="ui red segment">
                                                <a
                                                    class="message-bubble-link"
                                                    v-text="message.sender" 
                                                    style="margin-bottom:3px;display:inline"></a>
                                                <span 
                                                    style="font-size:0.8em; color:#777" 
                                                    v-text="message.time"></span>
                                                <p 
                                                    v-text="message.text" 
                                                    style="margin-bottom:3px"></p>
                                            </div>
                                        </sui-grid-row>
                                    </sui-grid-column>
                                </sui-grid> 
                            </sui-list-item>
                        </sui-list>
                    </sui-container>
                    <div class="flexbox ui icon input">
                        <input 
                            @keyup.enter="sendMessage()" 
                            style="border-radius:0px"
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
            this.threads.splice(this.threads.indexOf(thread), 1);
        },
        sendMessage: function() {
            if(this.message.length==0) return;
            this.selectedThread.messages.push({
                text: this.message,
                time: moment().format('HH:MM'),
                sender: 'live chatbot'
            });
            this.message = '';
        },
        newestMessage: function(thread) {
            return thread.messages[thread.messages.length-1].text.substring(0,13);
        }
    },
    mounted: function() {
        //load all non archived threads into thread array
    }
}       
</script>