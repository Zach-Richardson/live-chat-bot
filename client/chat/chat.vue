<template lang="html">
    <div class="ui container left aligned">

        <div class="ui basic segment" style="padding-top:5%">
            <h2 class="ui header">
                Chat
            </h2>
        </div>
        
        <sui-grid>
            <sui-grid-row :cols="2">
                <!-- Thread List -->
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
                                <sui-grid-column :width="4" @click="select(thread)">
                                    <sui-grid-row>
                                        <img :src="getAvatarURL(thread.user, '75')"
                                            style="border-radius:50%" />
                                    </sui-grid-row>
                                </sui-grid-column>
                                <sui-grid-column :width="7" @click="select(thread)">
                                    <sui-grid-row>
                                        <h3 
                                            style="margin-bottom:2px;" 
                                            v-text="thread.user.name"
                                            v-if="thread.user"></h3>
                                        <h3 
                                            style="margin-bottom:2px;font-weight:0.8em" 
                                            v-text="thread.user.name.concat(' (disconnected)')"
                                            v-if="!thread.user"></h3>
                                        <h4 
                                            style="color:#afafaf;margin-top:4px" 
                                            v-text="newestMessage(thread)" />
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
                <!-- /Thread List -->

                <!-- Message Window -->
                <sui-grid-column :width="10" style="padding-left:0px">
                    <sui-container
                        v-if="!selectedThread"
                        style="text-align:center;height:612px;">
                        <sui-label
                            color="grey"
                            size="large"
                            style="margin-top:50%">Thread not selected!</sui-label>
                    </sui-container>
                    <sui-container
                        id="messageWindow" 
                        v-else
                        style="overflow-x:hidden; overflow-y: scroll; height:612px;">
                        <div v-if="selectedThread" 
                            style="text-align:center;
                            background-color:rgb(165, 199, 223);
                            padding-top:10px">
                            <sui-label
                                color="blue"
                                size="large">Connection Request at {{selectedThread.timeStarted}}</sui-label>
                        </div>
                        <sui-list relaxed style="background-color:rgb(165, 199, 223);margin-top:0px">
                            <!-- MESSAGE HISTORY -->
                            <sui-list-item v-for="message in selectedThread.messageHistory">
                                <sui-list-content
                                    style="text-align:center;padding:9px">
                                </sui-list-content>
                                <sui-grid>
                                    <sui-grid-row
                                        :columns="3">
                                        <sui-grid-column :width="1"></sui-grid-column>
                                        <sui-grid-column :width="1" style="padding:0px">
                                            <img :src="getAvatarURL(message.sender, '50')"
                                                style="border-radius:50%" />
                                        </sui-grid-column>
                                        <sui-grid-column 
                                            :class="{
                                                'five wide':(message.text.length<30),
                                                'six wide':(message.text.length>=30),
                                                'seven wide':(message.text.length>=40),
                                                'eight wide':(message.text.length>=50),
                                                'nine wide':(message.text.length>=60),
                                                'ten wide':(message.text.length>=70),
                                                'eleven wide':(message.text.length>=80),
                                                'twelve wide':(message.text.length>=90)                                                
                                            }">
                                            <!-- Message Bubble -->
                                            <div style="padding:7px;margin:5px;word-wrap:break-word" class="ui red segment">
                                                <a
                                                    class="message-bubble-link"
                                                    v-text="message.sender.name" />
                                                <span 
                                                    style="font-size:0.8em; color:#777" 
                                                    v-text="message.time"></span>
                                                <div 
                                                    style="margin-bottom:3px"
                                                    v-text="message.text" ></div>
                                                <div v-if="message.actions!=null">
                                                    <sui-button
                                                        v-for="action in message.actions"
                                                        :style="{'background-color':action.color}">
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
                        <!-- /MESSAGE HISTORY -->
                        <!-- Connect Button -->
                        <div v-if="selectedThread" 
                            style="text-align:center;
                                background-color:rgb(165, 199, 223);
                                padding-bottom:10px">
                            <sui-button
                                v-if="!selectedThread.operator"
                                color="blue"
                                size="large"
                                @click="emitOperatorConnectResponse()">Connect</sui-button>
                            <sui-label
                                v-if="selectedThread.operator"
                                color="blue"
                                size="large">Connection Response at {{selectedThread.timeConnected}}</sui-label>
                        </div>
                        <!-- /Connect Button -->
                        <!-- MESSAGE WINDOW -->
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
                                            <img :src="getAvatarURL(message.sender, '50')"
                                                style="border-radius:50%" />
                                        </sui-grid-column>
                                        <sui-grid-column 
                                            :class="{
                                                'five wide':(message.text.length<30),
                                                'six wide':(message.text.length>=30),
                                                'seven wide':(message.text.length>=40),
                                                'eight wide':(message.text.length>=50),
                                                'nine wide':(message.text.length>=60),
                                                'ten wide':(message.text.length>=70),
                                                'eleven wide':(message.text.length>=80),
                                                'twelve wide':(message.text.length>=90)                                                
                                            }">
                                            <!-- Message Bubble -->
                                            <div style="padding:7px;margin:5px;word-wrap:break-word" class="ui red segment">
                                                <a
                                                    class="message-bubble-link"
                                                    v-text="message.sender.name" />
                                                <span 
                                                    style="font-size:0.8em; color:#777" 
                                                    v-text="message.time"></span>
                                                <div  
                                                    style="margin-bottom:3px"
                                                    v-text="message.text" ></div >
                                                <div v-if="message.actions!=null">
                                                    <sui-button
                                                        v-for="action in message.actions"
                                                        :style="{color:action.color}">
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
                </sui-grid-column>
                <!-- /Message Window -->
            </sui-grid-row>
        </sui-grid>

        

    </div>
</template>

<script>
'use strict'
const moment = require('moment');
let shared = require('../globalState');

module.exports = {
    data: () => ({ 
        global: shared.state,
        selectedThread: null,
        message: '',
        threads: []
    }),
    sockets: {
        connect: function () {
            //initializes the socket on page load
            this.$socket.emit('createConnection', this.global.userId);
        },
        message: function (op) {
            let mw = document.getElementById("messageWindow");
            const wasScrolledToBottom = mw.scrollHeight - mw.clientHeight <= mw.scrollTop + 1;
            this.threads.find(t => t.threadId == op.threadId).messages.push(op.message);
            if(this.selectedThread.threadId == op.threadId){
                this.selectedThread.messages.push(op.message);
            }
            setTimeout( () => { //scroll to the bottom of the chat window
                let mw2 = document.getElementById("messageWindow");
                if (wasScrolledToBottom) mw2.scrollTop = mw2.scrollHeight - mw2.clientHeight;
            }, 50);
        },
        operatorConnectionRequest: function (thread) {
            this.threads.push(thread);
        },
        threadUpdate: function (thread) {
            let t = this.threads.find(t => t.threadId == thread.threadId);;
            t = thread;
            if(this.selectedThread.threadId == t.threadId){
                this.selectedThread = thread;
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
        sendMessage: function() {
            if(this.message.length==0) return;
            let mw = document.getElementById("messageWindow");
            const wasScrolledToBottom = mw.scrollHeight - mw.clientHeight <= mw.scrollTop + 1;
            const msg = {
                text: this.message,
                time: moment().format('HH:MM'),
                sender: {
                    name: 'live chatbot',
                    id: '1',
                    gravatarHash: 'a'
                }
            };
            this.selectedThread.messages.push(msg);
            this.threads.find(t => t.threadId == this.selectedThread.threadId).messages.push(msg);
            this.$socket.emit('message', 
            {
                text: this.message,
                threadId: this.selectedThread.threadId,
            });
            this.message = ''; //clear the message
            setTimeout( () => { //scroll to the bottom of the chat window
                let mw2 = document.getElementById("messageWindow");
                if (wasScrolledToBottom) mw2.scrollTop = mw2.scrollHeight - mw2.clientHeight;
            }, 50);
            
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
            this.$socket.emit('operatorConnectResponse', {
                operatorId: this.global.userId,
                threadId: this.selectedThread.threadId
            });
        },
        getAvatarURL: function(sender, size){
            return `https://www.gravatar.com/avatar/${sender.gravatarHash}?s=${size}&d=identicon`;
            // return await util.getAvatarURL(sender);
        },
    },
    mounted: async function() {
        // const mw = document.getElementById("messageWindow");
        // setInterval(function() {
        //     const isScrolledToBottom = mw.scrollHeight - mw.clientHeight <= mw.scrollTop + 1;
        //     if (isScrolledToBottom) {
        //         mw.scrollTop = mw.scrollHeight - mw.clientHeight;
        //     }
        // }, 500)
    }
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
.lightbluebackground{
    background-color:rgb(165, 199, 223);
    cursor: pointer;
}
.message-bubble-link{
    color:#2E85C5;
    font-weight:1.2em;
    margin-bottom:3px;
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

.margintop {
    margin-top:10px;
}
</style>