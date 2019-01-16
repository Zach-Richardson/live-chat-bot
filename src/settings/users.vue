
<style scoped lang="scss">
div.listgap {
  margin-bottom: 3em !important;
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
  margin-right: 0.5em;
  width: 80%;
}
.userData {
  margin: 10px 0px 10px 0px !important;
  padding-top: 5%;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0px 2px 52px -16px rgba(0, 0, 0, 0.75);
}
</style>

<template>
  <div class="ui main text container left aligned">
    <sui-grid>
      <sui-grid-row>
        <sui-grid-column :width="16">
          <!-- Admin List -->
          <sui-grid>
            <sui-grid-row v-for="admin in admins" :key="admin.id" class="userData">
              <sui-grid-column :width="2">
                <object
                  type="image/svg+xml"
                  v-if="avatarURLs[`${admin.id}50`]"
                  :data="avatarURLs[`${admin.id}50`]"
                />
              </sui-grid-column>
              <sui-grid-column :width="12">
                <h3>{{admin.first_name}} {{admin.last_name}}</h3>
                <div>Email: {{admin.email}}</div>
                <div>Active Now: {{admin.is_active?'Yes':'No'}}</div>
                <div>Account Created: {{moment(admin.created).fromNow()}}</div>
                <div>Last Modified: {{moment(admin.modified).fromNow()}}</div>
              </sui-grid-column>
              <sui-grid-column :width="2">
                <sui-button
                  v-if="admin.id!=global.userId"
                  icon="trash"
                  color="red"
                  @click="removeAdmin(admin.id)"
                />
              </sui-grid-column>
            </sui-grid-row>
          </sui-grid>
          <!-- /Admin List -->
        </sui-grid-column>
      </sui-grid-row>
      <sui-grid-row>
        <sui-button content="Add User" color="green" @click="showingNewUserModal = true"/>
      </sui-grid-row>
    </sui-grid>

    <!-- New User Modal -->
    <div>
      <sui-modal v-model="showingNewUserModal" size="tiny">
        <sui-modal-header style="text-align:center">Add User</sui-modal-header>
        <sui-modal-content style="text-align:center">
          <sui-modal-description>
            <!-- Search Input -->
            <span class="flexbox ui left icon input">
              <sui-icon name="at"/>
              <input
                @keyup.enter="searchUser()"
                v-model="newUserTag"
                type="text"
                placeholder="Enter a user tag..."
              >
            </span>
            <div v-if="tagMessage" class="ui small message red">{{tagMessage}}</div>
            <!-- /Search Input -->
            <!-- New User Info -->
            <div class="ui card" style="margin-left:88px" v-if="newUser">
              <div class="image">
                <object
                  type="image/svg+xml"
                  v-if="avatarURLs[`${newUser.id}50`]"
                  :data="avatarURLs[`${newUser.id}50`]"
                />
              </div>
              <div class="content">
                <a class="header">{{newUser.first_name}} {{newUser.last_name}}</a>
                <div class="meta">
                  <span class="date">{{newUser.email}}</span>
                </div>
              </div>
            </div>
            <!-- /New User Info -->
            <sui-button v-if="newUser" class="green" @click="addUser()" content="Add User"/>
          </sui-modal-description>
        </sui-modal-content>
        <sui-modal-actions style="padding:10px;text-align:center">
          <sui-button class="grey" @click="showingNewUserModal=false" content="Close"/>
        </sui-modal-actions>
      </sui-modal>
    </div>
    <!-- /New User Modal -->
  </div>
</template>

<script>
import shared from "../globalState";
import util from "../util";
import moment from "moment";
const REFRESH_POLL_RATE = 15000;

export default {
  data: () => ({
    admins: [],
    newUser: null,
    newUserTag: "",
    avatarURLs: {},
    tagMessage: "",
    global: shared.state,
    interval: null,
    groups: {},
    showingNewUserModal: false,
    moment
  }),
  methods: {
    getAdmins: function() {
      util.fetch.call(this, "/api/auth/admins/v1").then(result => {
        if (result.ok) {
          this.admins = result.theJson.administrators;
          for (let i = 0; i < this.admins.length; i++) {
            this.configAvatarURL(this.admins[i], "50");
          }
        } else {
          console.log("error retrieving admin data from /api/auth/admins/v1");
          console.log(result);
        }
      });
    },
    removeAdmin: function(id) {
      this.groups.forEach(group => {
        group.users = group.users.filter(u => u.id != id);
      });
      this.saveGroupData();
      this.admins.splice(
        this.admins.indexOf(this.admins.find(a => a.id == id)),
        1
      );
      let options = { method: "post", body: { op: "remove", id } };
      util.fetch
        .call(this, "/api/auth/admins/v1", options)
        .then(res => {
          if (res.ok) {
            this.tagMessage = "";
          } else {
            this.tagMessage = util.mergeErrors(res.theJson);
          }
        })
        .catch(err => console.log(err));
    },
    configAvatarURL: async function(user, size) {
      if (this.avatarURLs[`${user.id}${size}`]) {
        return;
      }
      const userData = {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        gravatarHash: user.gravatar_hash
      };
      const url = await util.getAvatarURL(userData, size);
      this.$set(this.avatarURLs, `${user.id}${size}`, url);
    },
    searchUser: function() {
      const op = { method: "get", headers: { userTag: this.newUserTag } };
      util.fetch.call(this, "api/settings/user", op).then(res => {
        if (res.ok) {
          this.tagMessage = null;
          this.newUser = res.theJson;
          this.configAvatarURL(res.theJson, "50");
        } else {
          this.newUser = null;
          this.tagMessage = "User not found.";
        }
      });
    },
    addUser: function() {
      this.admins.push(this.newUser);
      let options = {
        method: "post",
        body: { op: "add", tag: this.newUserTag }
      };
      util.fetch
        .call(this, "/api/auth/admins/v1", options)
        .then(result => {
          if (result.ok) {
            for (let i = 0; i < this.admins.length; i++) {
              this.configAvatarURL(this.admins[i], "50");
            }
          } else {
            console.log("error retrieving admin data from /api/auth/admins/v1");
            console.log(result);
          }
        })
        .catch(err => console.log(err));
      this.groups.find(group => group.name == "All").users.push(this.newUser);
      this.saveGroupData();
      this.newUser = null;
      this.newUserTag = "";
      this.showingNewUserModal = false;
    },
    loadGroups: async function() {
      this.groups = (await util.fetch.call(
        this,
        "/api/settings/groups/"
      )).theJson;
    },
    saveGroupData: function() {
      const options = { method: "post", body: { groups: this.groups } };
      util.fetch.call(this, "api/settings/groups", options);
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
};
</script>
