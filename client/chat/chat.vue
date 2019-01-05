<template lang="html">
    <div class="ui container left aligned">

        <div class="ui basic segment" style="padding-top:5%">
            <h2 class="ui header">
                Chat
            </h2>
        </div>
        
        <sui-grid>
            <sui-grid-row :cols="2">
                <!-- THREAD LIST -->
                <sui-grid-column :width="6" style="padding-right:0px">
                    <sui-list divided relaxed style="overflow-x:hidden; overflow-y: scroll; height:650px">
                        <sui-list-item
                            v-for="thread in threads"
                            style="padding:3px"
                            :class="{
                                flashingblue: thread.operator==null, 
                                bluebackground: selectedThread==thread&&thread.operator!=null,
                                greybackground: !thread.user,
                                darkgreybackground: !thread.user&&selectedThread==thread,
                                hoverblue: thread.operator&&selectedThread!=thread&&thread.user
                            }">     
                            <sui-grid :columns="3">
                                <sui-grid-row>
                                    <sui-grid-column :width="4" @click="select(thread)">
                                        <object type="image/svg+xml" :data="thread.user.avatarURL" />
                                    </sui-grid-column>
                                    <sui-grid-column :width="10" @click="select(thread)">
                                        <h3 
                                            style="margin-bottom:2px;" 
                                            v-text="thread.user.name"
                                            v-if="thread.user"></h3>
                                        <h3 
                                            style="margin-bottom:2px;font-weight:0.8em" 
                                            v-text="thread.user.name.concat(' (disconnected)')"
                                            v-if="!thread.user"></h3>
                                        <span 
                                            style="color:#afafaf;margin-top:4px" 
                                            v-text="newestMessage(thread)" />
                                    </sui-grid-column>
                                    <sui-grid-column :width="2">
                                        <sui-icon
                                            @click="archive(thread)"
                                            style="display:inline"
                                            class="hover-red pull-right"
                                            name="archive"/>
                                    </sui-grid-column>
                                </sui-grid-row>
                            </sui-grid>                       
                        </sui-list-item>
                    </sui-list>

                </sui-grid-column>
                <!-- /THREAD LIST -->

                <!-- MESSAGE WINDOW -->
                <sui-grid-column :width="10" style="padding-left:0px">
                    <sui-container
                        v-if="!selectedThread"
                        style="text-align:center;height:612px;">
                        <sui-label
                            v-if="threads.length!=0"
                            color="grey"
                            size="large"
                            style="margin-top:50%">Thread not selected!</sui-label>
                        <sui-label
                            v-else
                            color="grey"
                            size="large"
                            style="margin-top:50%">No threads are available!</sui-label>
                    </sui-container>
                    <sui-container
                        id="messageWindow" 
                        v-else
                        style="overflow-x:hidden; overflow-y: scroll; height:612px;">
                        <sui-list relaxed style="background-color:#e8e8e8;margin-top:0px">
                            <!-- Message History -->
                            <sui-list-item v-for="message in selectedThread.messageHistory">
                                <sui-list-content
                                    style="text-align:center;padding:9px">
                                </sui-list-content>
                                <sui-grid>
                                    <sui-grid-row
                                        :columns="3">
                                        <sui-grid-column :width="1"></sui-grid-column>
                                        <sui-grid-column :width="1" style="padding:0px">
                                            <object type="image/svg+xml" 
                                                :data="message.sender.avatarURL" />
                                        </sui-grid-column>
                                        <sui-grid-column 
                                            :class="{
                                                'six wide':(message.text.length<=30),
                                                'seven wide':(message.text.length>=30),
                                                'eight wide':(message.text.length>=40),
                                                'nine wide':(message.text.length>=50),
                                                'ten wide':(message.text.length>=60),
                                                'eleven wide':(message.text.length>=70),
                                                'twelve wide':(message.actions||message.text.length>=80)                                                
                                            }">
                                            <!-- Message Bubble -->
                                            <div style="padding:11px;word-wrap:break-word" class="ui grey segment">
                                                <a
                                                    class="message-bubble-link"
                                                    v-text="message.sender.name" />
                                                <span
                                                    style="font-size:0.8em;color:#777;margin-left:4px">
                                                    {{message.timeSinceSent}}   
                                                </span>
                                                <div 
                                                    style="margin-bottom:3px;margin-top:6px"
                                                    v-text="message.text" ></div>
                                                <div v-if="message.actions" style="margin-top:7px">
                                                    <sui-button
                                                        v-for="action in message.actions"
                                                        :style="{'background-color':action.color}"
                                                        style="text-align:left;width:100%">
                                                        {{action.title}}
                                                    </sui-button>
                                                </div>
                                            </div>
                                            <!-- /Message Bubble -->
                                        </sui-grid-column>
                                    </sui-grid-row>
                                </sui-grid> 
                            </sui-list-item>
                        </sui-list>
                        <!-- /Message History -->
                        <!-- Connect Button -->
                        <div v-if="selectedThread" 
                            style="text-align:center;">
                            <sui-label
                                color="grey"
                                style="width:100%;border-radius:0px;margin-top:5px"
                                size="large">Connection Request {{selectedThread.timeSinceStarted}}</sui-label>
                            <sui-button
                                v-if="!selectedThread.operator"
                                color="blue"
                                size="large"
                                style="width:100%;border-radius:0px"
                                @click="emitOperatorConnectResponse()">Connect</sui-button>
                            <sui-label
                                v-else
                                color="blue"
                                size="large"
                                style="width:100%;border-radius:0px;margin:0px">
                                Connection Response {{selectedThread.timeSinceConnected}}
                            </sui-label>
                        </div>
                        <!-- /Connect Button -->
                        <!-- Live Messages -->
                        <sui-list relaxed>
                            <sui-list-item v-for="message in selectedThread.messages">
                                <sui-list-content
                                    style="text-align:center;padding:9px">
                                </sui-list-content>
                                <sui-grid>
                                    <sui-grid-row
                                        :columns="3">
                                        <sui-grid-column :width="1"></sui-grid-column>
                                        <sui-grid-column :width="1" style="padding:0px">
                                            <object type="image/svg+xml" 
                                                :data="message.sender.avatarURL" />
                                        </sui-grid-column>
                                        <sui-grid-column 
                                            :class="{
                                                'six wide':(message.text.length<=30),
                                                'seven wide':(message.text.length>=30),
                                                'eight wide':(message.text.length>=40),
                                                'nine wide':(message.text.length>=50),
                                                'ten wide':(message.text.length>=60),
                                                'eleven wide':(message.text.length>=70),
                                                'twelve wide':(message.actions||message.text.length>=80)                                                
                                            }">
                                            <!-- Message Bubble -->
                                            <div style="padding:11px;word-wrap:break-word" class="ui red segment">
                                                <a
                                                    class="message-bubble-link"
                                                    v-text="message.sender.name" />
                                                <span
                                                    style="font-size:0.8em;color:#777;margin-left:4px">
                                                    {{message.timeSinceSent}}
                                                </span>
                                                <div  
                                                    style="margin-bottom:3px;margin-top:6px"
                                                    v-text="message.text"></div >
                                                <div v-if="message.actions!=null" style="margin-top:7px">
                                                    <sui-button
                                                        v-for="action in message.actions"
                                                        :style="{color:action.color}"
                                                        style="text-align:left;width:100%"
                                                        {{action.title}}
                                                    </sui-button>
                                                </div>
                                            </div>
                                            <!-- /Message Bubble -->
                                        </sui-grid-column>
                                    </sui-grid-row>
                                </sui-grid> 
                            </sui-list-item>
                        </sui-list>
                    </sui-container>
                    <!-- /Live Messages -->
                    <!-- Message Input Box -->
                    <div class="flexbox ui icon input">
                        <input 
                            @keyup.enter="sendMessage()" 
                            style="border-radius:0px"
                            type="text" 
                            placeholder="Type your message..."
                            v-model="message">
                        <!-- <i 
                            @click="startVideoCall()" 
                            style="margin-right:20px"
                            class="video camera link icon"></i> -->
                        <i 
                            @click="sendMessage()" 
                            class="paper plane outline link icon"></i>
                    </div>
                    <!-- /Message Input Box -->
                </sui-grid-column>
                <!-- /MESSAGE WINDOW -->
            </sui-grid-row>
        </sui-grid>
    </div>
</template>

<script>
'use strict'
const moment = require('moment');
let shared = require('../globalState');
const TIME_SINCE_SENT_REFRESH_RATE = 15*1000;//ms

module.exports = {
    data: () => ({ 
        global: shared.state,
        selectedThread: null,
        message: '',
        threads: [],
        avatarURLs: {}
    }),
    sockets: {
        connect: function () {
            //initializes the socket on page load
            this.$socket.emit('createConnection', this.global.userId);
        },
        message: function (op) {
            let mw = document.getElementById("messageWindow");
            const wasScrolledToBottom = mw.scrollHeight - mw.clientHeight <= mw.scrollTop + 1;
            let thread = this.threads.find(t => t.threadId == op.threadId);
            thread.messages.push(op.message);
            let cur = thread.messages[thread.messages.length-1];
            this.configAvatarURL(cur.sender, '35');
            this.configTimeSinceSent(cur, 'timeSinceSent', cur.time);
            this.scrollToBottomIf(mw, wasScrolledToBottom);
        },
        operatorConnectionRequest: function (thread) {
            this.configTimeSinceSent(thread, 'timeSinceStarted', thread.timeStarted);
            this.configAvatarURL(thread.user, '55');
            thread.messageHistory.forEach(msg => {
                this.configTimeSinceSent(msg, 'timeSinceSent', msg.time)
                this.configAvatarURL(msg.sender, '35');
            });
            this.threads.push(thread);
        },
        threadUpdate: function (op) {
            let thread = this.threads.find(t => t.threadId == op.threadId)
            for(let key in op){
                if(thread.hasOwnProperty(key)) thread[key] = op[key];
                else{
                    console.log('key not found in threadUpdate, key:' + key);
                    console.log(op);
                }
            }
            if(thread.operator){
                this.configAvatarURL(thread.operator, '55');
            }
        }
    },
    methods: {
        select: function(thread) {
            this.selectedThread = thread;
            setTimeout( () => {
                let mw = document.getElementById("messageWindow");
                this.selectedThread.lastScroll = mw.scrollTop;
                mw.scrollTop = thread.lastScroll || (mw.scrollHeight - mw.clientHeight);
            }, 50);
        },
        archive: function(thread) {
            this.threads.splice(this.threads.indexOf(thread), 1);
        },
        sendMessage: async function() {
            if(this.message.length==0) return;
            let mw = document.getElementById("messageWindow");
            const wasScrolledToBottom = mw.scrollHeight - mw.clientHeight <= mw.scrollTop + 1;
            const msg = {
                text: this.message,
                time: (new Date()).toUTCString(),
                timeSinceSent: '',
                sender:{
                    id: this.global.userId,
                    name: 'needstobewiredin',
                    gravatarHash: 'a',
                    avatarURL: ''
                }
            };
            this.configAvatarURL(msg.sender, '35');
            this.configTimeSinceSent(msg, 'timeSinceSent', msg.time);
            this.threads.find(t => t.threadId == this.selectedThread.threadId).messages.push(msg);
            this.$socket.emit('message', 
            {
                text: this.message,
                threadId: this.selectedThread.threadId,
            });
            this.message = ''; //clear the message
            this.scrollToBottomIf(mw, wasScrolledToBottom);
        },
        newestMessage: function(thread) {
            if(thread.messages.length==0){
                return thread.messageHistory[thread.messageHistory.length-1].text;
            }else {
                return thread.messages[thread.messages.length-1].text;
            }
        },
        isMessageAfterConnect: function(message) {
            return (!message.beforeConnect
                &&this.selectedThread.messages[this.selectedThread.messages.indexOf(message)-1].beforeConnect);
        },
        isMessageBeforeConnect: function(message) {
            return this.selectedThread.messages.indexOf(message) == 0 ||(message.beforeConnect
                &&!this.selectedThread.messages[this.selectedThread.messages.indexOf(message)+1].beforeConnect);
        },
        startVideoCall: function() {

        },
        emitOperatorConnectResponse: function(){
            const timeNow = (new Date()).toUTCString();
            this.selectedThread.timeConnected = timeNow;
            this.configTimeSinceSent(this.selectedThread, 'timeSinceConnected', timeNow);
            this.$socket.emit('operatorConnectResponse', {
                operatorId: this.global.userId,
                threadId: this.selectedThread.threadId,
                timeConnected: timeNow
            });
        },
        configAvatarURL: async function(sender, size){
            if(this.avatarURLs[sender.id]){
                sender.avatarURL = this.avatarURLs[sender.id];
                return;
            }
            this.avatarURLs[sender.id] = sender.avatarURL = await util.getAvatarURL(sender, size);
        },
        configTimeSinceSent: function(object, key, time){
            object[key] = moment(time).fromNow()
            setInterval(
                () => {object[key] = moment(time).fromNow()},
                TIME_SINCE_SENT_REFRESH_RATE
            );
        },
        scrollToBottomIf: function(div, condition){
            setTimeout( (div, condition) => {
                if (condition){
                    div.scrollTop = div.scrollHeight - div.clientHeight;
                } 
            }, 50, div, condition);
        }
    },
}       
</script>

<style>
.hoverblue:hover{
    background-color:#0088CB;
    cursor:pointer;
}
.bluebackground{
    background-color:#0088CB;
    cursor:pointer;
}
.greybackground{
    background-color:rgb(187, 187, 187);
    cursor: pointer;
}
.greybackground:hover{
    background-color:#989898;
}
.darkgreybackground{
    background-color:rgb(139, 139, 139);
    cursor: pointer;
}
.darkgreybackground:hover{
    background-color:#7a7a7a;
}
.lightgreybackground{
    background-color:#cce2ff;
    cursor: pointer;
}
.message-bubble-link{
    color:#2E85C5;
    font-weight:500;
    margin-bottom:3px;
}
.message-bubble-link:hover{
    color:rgb(35, 107, 158);
    font-weight:500;
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

.margintop {
    margin-top:10px;
}
</style>