<template lang="html">
    <div class="ui container left aligned">
        <sui-grid class="shadow" style="margin-top:100px">
            <sui-grid-row :cols="2" style="padding:0px;">
                <!-- THREAD LIST -->
                <sui-grid-column :width="4" style="padding:0px;height:612px;">
                    <sui-container
                        v-if="threads.length==0"
                        class="threadListPlaceholder">
                        <sui-label
                            color="grey"
                            size="large"
                            style="margin-top:200px">0 Th   reads </sui-label>
                    </sui-container>
                    <sui-list
                        v-else
                        divided relaxed
                        style="overflow-x:hidden;overflow-y:scroll;height:100%;margin:0px">
                        <sui-list-item
                            v-for="thread in threads"
                            :key="thread.threadId"
                            style="padding:5px"
                            :class="{
                                bluebackground: selectedThread==thread,
                                greybackground: !thread.user,
                                darkgreybackground: !thread.user&&selectedThread==thread,
                                hoverblue: selectedThread!=thread
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
                                    <sui-grid-column :width="2" :class="{bluebackground:thread.operator==null}">
                                        <sui-icon
                                            v-if="thread.timeEnded"
                                            @click="archive(thread)"
                                            style="display:inline"
                                            class="hover-red pull-right"
                                            name="archive"/>
                                    </sui-grid-column>
                                </sui-grid-row>
                            </sui-grid>                       
                        </sui-list-item>
                    </sui-list>
                    <sui-button
                        icon="archive"
                        style="width:100%;border-radius:0px;margin:0px;height:38px;padding-top:11px;" 
                        size="large" 
                        content="Show Archived" 
                        @click="showingArchiveModal=true"/>
                </sui-grid-column>
                <!-- /THREAD LIST -->

                <!-- MESSAGE WINDOW -->
                <sui-grid-column :width="12" style="padding:0px">
                    <sui-container
                        v-if="!selectedThread||threads.length==0"
                        style="text-align:center;background-color:#ccc;height:612px">
                        <sui-label
                            v-if="threads.length!=0"
                            color="grey"
                            size="large"
                            style="margin-top:200px">Thread not selected!</sui-label>
                    </sui-container>
                    <sui-container
                        id="messageWindow" 
                        v-else
                        :class="{'tall':!selectedThread.timeConneceted,'short':selectedThread.timeConnected}"
                        style="overflow-x:hidden; overflow-y: scroll;">

                        <sui-grid style="background-color:#e8e8e8;margin-top:0px;padding-bottom:20px">
                            <sui-grid-row v-for="message in selectedThread.messageHistory" :columns="3">
                                <sui-grid-column :width="1"></sui-grid-column>
                                <sui-grid-column style="width:50px !important;padding:0px;text-align:center">
                                    <object type="image/svg+xml" 
                                        :data="message.sender.avatarURL" />
                                </sui-grid-column>
                                <sui-grid-column style="width:auto !important;max-width:800px;word-wrap:break-word;whitespace:nowrap;">
                                    <!-- Message Bubble -->
                                    <div 
                                        :style="getSegmentColor(message.sender)" 
                                        style="padding:11px;word-wrap:break-word" 
                                        class="ui grey segment">
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
                                        <div v-if="message.actions" style="margin-top:7px;width:auto">
                                            <sui-button
                                                v-for="action in message.actions"
                                                :style="{'background-color':action.color}"
                                                style="text-align:left;display:block;width:100%">
                                                {{action.title}}
                                            </sui-button>
                                        </div>
                                    </div>
                                    <!-- /Message Bubble -->
                                </sui-grid-column>
                            </sui-grid-row>
                        </sui-grid> 
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
                        <sui-grid style="margin-top:20px">
                            <sui-grid-row v-for="message in selectedThread.messages" :columns="3">
                                <sui-grid-column :width="1"></sui-grid-column>
                                <sui-grid-column style="width:50px !important;padding:0px;text-align:center">
                                    <object type="image/svg+xml" 
                                        :data="message.sender.avatarURL" />
                                </sui-grid-column>
                                <sui-grid-column style="width:auto !important;max-width:600px;word-wrap:break-word;whitespace:nowrap;">
                                    <!-- Message Bubble -->
                                    <div
                                        :style="getSegmentColor(message.sender)" 
                                        style="padding:11px;word-wrap:break-word" 
                                        class="ui segment">
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
                                    </div>
                                    <!-- /Message Bubble -->
                                </sui-grid-column>
                            </sui-grid-row>
                        </sui-grid>
                    </sui-container>
                    <!-- /Live Messages -->
                    <!-- Message Input Box -->
                    <div v-if="selectedThread&&selectedThread.timeConnected" 
                        style="text-align:center;">
                        <sui-button
                            v-if="!selectedThread.timeEnded"
                            color="grey"
                            size="large"
                            style="height:27px;width:100%;border-radius:0px;font-size:.85714286rem;padding:3px"
                            @click="emitEndConversation()">End Conversation</sui-button>
                        <sui-label
                            v-else
                            color="red"
                            size="large"
                            style="width:100%;border-radius:0px;margin:0px">
                            Conversation ended {{selectedThread.timeSinceEnded}}
                            <span @click="archive(selectedThread)" class="archiveButton">Archive It</span>
                        </sui-label>
                    </div>
                    <div
                        :class="{'disabled':!selectedThread||selectedThread.timeEnded}" 
                        class="flexbox ui icon input">
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

        <div>
            <sui-modal v-model="showingArchiveModal" size="small">
                <sui-modal-header style="text-align:center">
                    <sui-icon 
                        size="large" 
                        name="archive" />Archived Threads
                    </sui-modal-header>
                <sui-modal-content>
                    <sui-modal-description>
                        <sui-header></sui-header>
                        <sui-list divided style="height:500px;overflow-x:none;overflow-y:scroll">
                            <sui-list-item 
                                v-for="thread in global.archive"
                                :key="thread.threadId"
                                style="margin-top:5px">
                                <sui-list-content style="padding-right:10px">
                                    <h4 v-text="thread.user.name" />
                                    <span class="grey" v-text="moment(thread.timeStarted).fromNow()" />
                                    <span class="grey">, {{thread.messages.length}} messages</span>
                                    <sui-button
                                        class="pull-right"
                                        icon="trash"
                                        color="red"
                                        @click="deleteThreadFromArchive(thread)" />
                                    <sui-button
                                        class="pull-right"
                                        content="Restore"
                                        color="grey"
                                        @click="restoreThread(thread)" />
                                </sui-list-content>
                            </sui-list-item>
                        </sui-list>
                    </sui-modal-description>
                </sui-modal-content>
                <sui-modal-actions style="padding:10px">
                    <sui-button 
                        class="grey"
                        @click="showingArchiveModal=false"
                        content="Close" />
                </sui-modal-actions>
            </sui-modal>
        </div>
    </div>
</template>

<script>
import shared from "../globalState";
import util from "../util";
import moment from "moment";
const TIME_SINCE_SENT_REFRESH_RATE = 15 * 1000; //ms
const MESSAGE_AVATAR_SIZE = "35"; //px
const THREAD_AVATAR_SIZE = "50";

export default {
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js" // 'vue/dist/vue.common.js' for webpack 1
    }
  },
  data: () => ({
    global: shared.state,
    selectedThread: null,
    message: "",
    avatarURLs: {},
    threads: [],
    showingArchiveModal: false,
    threadArchive: [],
    moment
  }),
  mounted: async function() {
    this.$socket.emit("createConnection", this.global.userId);
    let t = shared.state.threads;
    const initializeThreadTimeAndAvatar = async function(t) {
      this.configAvatarURL(t.user, THREAD_AVATAR_SIZE);
      this.configTimeSinceSent(t, "timeSinceStarted", t.timeStarted);
      if (t.timeConnected) {
        this.configTimeSinceSent(t, "timeSinceConnected", t.timeConnected);
      }
      if (t.timeEnded) {
        this.configTimeSinceSent(t, "timeSinceEnded", t.timeEnded);
      }
      t.messages.forEach(m => {
        this.configAvatarURL(m.sender, MESSAGE_AVATAR_SIZE);
        this.configTimeSinceSent(m, "timeSinceSent", m.time);
      });
      t.messageHistory.forEach(m => {
        this.configAvatarURL(m.sender, MESSAGE_AVATAR_SIZE);
        this.configTimeSinceSent(m, "timeSinceSent", m.time);
      });
    }.bind(this);
    for (let i = 0; i < t.length; i++) {
      await initializeThreadTimeAndAvatar(t[i]);
    }
    this.threadArchive = shared.state.archive;
    this.threads = t;
  },
  sockets: {
    connect: function() {
      //initializes the socket on page load
      this.$socket.emit("createConnection", this.global.userId);
    },
    message: async function(op) {
      let mw = document.getElementById("messageWindow");
      const wasScrolledToBottom =
        mw.scrollHeight - mw.clientHeight <= mw.scrollTop + 1;
      let thread = this.threads.find(t => t.threadId == op.threadId);
      thread.messages.push(op.message);
      let cur = thread.messages[thread.messages.length - 1];
      await this.configAvatarURL(cur.sender, MESSAGE_AVATAR_SIZE);
      this.configTimeSinceSent(cur, "timeSinceSent", cur.time);
      this.scrollToBottomIf(mw, wasScrolledToBottom);
      this.saveThreads();
    },
    operatorConnectionRequest: async function(thread) {
      this.configTimeSinceSent(thread, "timeSinceStarted", thread.timeStarted);
      await this.configAvatarURL(thread.user, THREAD_AVATAR_SIZE);
      let configMessage = async function(msg) {
        this.configTimeSinceSent(msg, "timeSinceSent", msg.time);
        await this.configAvatarURL(msg.sender, MESSAGE_AVATAR_SIZE);
      }.bind(this);
      for (let i = 0; i < thread.messageHistory.length; i++) {
        await configMessage(thread.messageHistory[i]);
      }
      this.threads.push(thread);
      this.saveThreads();
    },
    threadUpdate: function(op) {
      let thread = this.threads.find(t => t.threadId == op.threadId);
      for (let key in op) {
        if (thread.hasOwnProperty(key)) thread[key] = op[key];
        else {
          console.log("key not found in threadUpdate, key:" + key);
          console.log(op);
        }
      }
      if (thread.operator) {
        this.configAvatarURL(thread.operator, THREAD_AVATAR_SIZE);
      }
      this.saveThreads();
    },
    removeThread: function(threadId) {
      let thread = this.threads.find(t => t.threadId == threadId);
      this.threads.splice(this.threads.indexOf(thread), 1);
    }
  },
  methods: {
    select: function(thread) {
      this.selectedThread = thread;
      shared.state.selectedThread = thread;
      setTimeout(() => {
        let mw = document.getElementById("messageWindow");
        this.selectedThread.lastScroll = mw.scrollTop;
        mw.scrollTop = thread.lastScroll || mw.scrollHeight - mw.clientHeight;
      }, 50);
    },
    archive: function(thread) {
      this.threadArchive.unshift(thread);
      this.threads.splice(this.threads.indexOf(thread), 1);
      if (
        this.selectedThread &&
        thread.threadId == this.selectedThread.threadId
      ) {
        this.selectedThread = null;
        shared.state.selectedThread = null;
      }
      this.saveThreads();
      this.saveArchive();
    },
    restoreThread: function(thread) {
      this.threadArchive.splice(this.threadArchive.indexOf(thread), 1);
      this.threads.push(thread);
      this.saveThreads();
      this.saveArchive();
    },
    sendMessage: async function() {
      if (this.message.length == 0) return;
      const msg = {
        text: this.message,
        time: new Date().toUTCString(),
        timeSinceSent: "",
        sender: {
          id: this.global.userId,
          name: this.global.ourName,
          gravatarHash: this.global.gravatarHash,
          avatarURL: this.global.avatarURL
        }
      };
      this.configTimeSinceSent(msg, "timeSinceSent", msg.time);
      this.threads
        .find(t => t.threadId == this.selectedThread.threadId)
        .messages.push(msg);
      this.$socket.emit("message", {
        text: this.message,
        threadId: this.selectedThread.threadId
      });
      this.message = "";
      let mw = document.getElementById("messageWindow");
      this.scrollToBottomIf(mw, true);
      this.saveThreads();
    },
    newestMessage: function(thread) {
      if (thread.messages.length == 0) {
        return thread.messageHistory[thread.messageHistory.length - 1].text;
      } else {
        return thread.messages[thread.messages.length - 1].text;
      }
    },
    isMessageAfterConnect: function(message) {
      return (
        !message.beforeConnect &&
        this.selectedThread.messages[
          this.selectedThread.messages.indexOf(message) - 1
        ].beforeConnect
      );
    },
    isMessageBeforeConnect: function(message) {
      return (
        this.selectedThread.messages.indexOf(message) == 0 ||
        (message.beforeConnect &&
          !this.selectedThread.messages[
            this.selectedThread.messages.indexOf(message) + 1
          ].beforeConnect)
      );
    },
    startVideoCall: function() {},
    emitOperatorConnectResponse: function() {
      const timeNow = new Date().toUTCString();
      this.threads.find(
        t => t.threadId == this.selectedThread.threadId
      ).timeConnected = timeNow;
      this.selectedThread.timeConnected = timeNow;
      this.configTimeSinceSent(
        this.selectedThread,
        "timeSinceConnected",
        timeNow
      );
      this.$socket.emit("operatorConnectResponse", {
        operatorId: this.global.userId,
        threadId: this.selectedThread.threadId,
        timeConnected: timeNow
      });
      this.saveThreads();
    },
    emitEndConversation: function() {
      const timeNow = new Date().toUTCString();
      this.selectedThread.timeEnded = timeNow;
      this.configTimeSinceSent(this.selectedThread, "timeSinceEnded", timeNow);
      this.$socket.emit("endThread", {
        operatorId: this.global.userId,
        threadId: this.selectedThread.threadId,
        timeEnded: timeNow
      });
      this.saveThreads();
    },
    configAvatarURL: async function(sender, size) {
      if (sender.avatarURL) {
        sender.avatarURL = null;
      }
      const key = `${sender.id}${size}`;
      const avatarURL = this.avatarURLs[key]
        ? this.avatarURLs[key]
        : await util.getAvatarURL(sender, size);
      this.$set(sender, "avatarURL", avatarURL);
    },
    scrollToBottomIf: function(div, condition) {
      setTimeout(
        (div, condition) => {
          if (condition) {
            div.scrollTop = div.scrollHeight - div.clientHeight;
          }
        },
        50,
        div,
        condition
      );
    },
    saveThreads: function() {
      shared.state.threads = this.threads;
    },
    saveArchive: function() {
      shared.state.archive = this.threadArchive;
    },
    clearThreads: function() {
      shared.state.threads = [];
      this.threads = [];
      this.selectedThread = null;
    },
    configTimeSinceSent: function(object, key, time) {
      this.$set(object, key, moment(time).fromNow());
      setInterval(() => {
        object[key] = moment(time).fromNow();
      }, TIME_SINCE_SENT_REFRESH_RATE);
    },
    deleteThreadFromArchive: function(thread) {
      this.threadArchive = this.threadArchive.filter(
        t => t.threadId != thread.threadId
      );
      this.saveArchive();
    },
    getSegmentColor: function(user) {
      const FL =
        user.name
          .split(" ")[0]
          .charAt(0)
          .toUpperCase() +
        user.name
          .split(" ")[1]
          .charAt(0)
          .toUpperCase();
      return `border-top:2px solid ${util.getThemeColorFromHash(FL)}!important`;
    }
  }
};
</script>

<style scoped lang="scss">
.hoverblue:hover {
  background-color: #0088cb;
  cursor: pointer;
}
.bluebackground {
  background-color: #0088cb;
  cursor: pointer;
}
.greybackground {
  background-color: rgb(187, 187, 187);
  cursor: pointer;
}
.greybackground:hover {
  background-color: #989898;
}
.darkgreybackground {
  background-color: rgb(139, 139, 139);
  cursor: pointer;
}
.darkgreybackground:hover {
  background-color: #7a7a7a;
}
.lightgreybackground {
  background-color: #cce2ff;
  cursor: pointer;
}
.message-bubble-link {
  color: #2e85c5;
  font-weight: 500;
  margin-bottom: 3px;
}
.message-bubble-link:hover {
  color: rgb(35, 107, 158);
  font-weight: 500;
}
.hover-red:hover {
  color: #e72133;
  cursor: pointer;
}
.flexbox {
  display: flex;
  flex: 1;
  margin-right: 0.5em;
  width: 100%;
}

.pull-right {
  float: right;
  margin-right: 0.25em;
}

.margintop {
  margin-top: 10px;
}

.threadListPlaceholder {
  text-align: center;
  background-color: #eee;
  height: 100%;
}

.shadow {
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0px 2px 52px -16px rgba(0, 0, 0, 0.75);
}
.autoWidth {
  width: auto !important;
  word-wrap: break-word;
}
.tall {
  height: 612px !important;
}
.short {
  height: 587px !important;
}
.archiveButton {
  background-color: #777;
  padding: 3px 5px 3px 5px;
  border-radius: 9px;
  margin: 3px 0px 3px 10px;
  cursor: pointer;
}
.archiveButton:hover {
  background-color: #555;
  padding: 3px 5px 3px 5px;
  border-radius: 9px;
  margin: 3px 0px 3px 10px;
  cursor: pointer;
}
</style>
