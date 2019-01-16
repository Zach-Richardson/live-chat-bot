
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
.groupData {
  margin: 20px 0px 20px 0px !important;
  padding-top: 5%;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0px 2px 52px -16px rgba(0, 0, 0, 0.75);
}
.groupUserList {
  border-radius: 2px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
</style>

<template>
  <div class="ui main text container left aligned">
    <sui-grid>
      <sui-grid-row>
        <sui-grid-column :width="16">
          <!-- Group List -->
          <sui-grid>
            <sui-grid-row class="groupData" v-for="group in groups" :key="group.name">
              <sui-grid-column :width="2">
                <sui-list-icon name="users" size="big"/>
              </sui-grid-column>
              <sui-grid-column :width="12">
                <h3 v-text="group.name" style="margin-bottom:20px"></h3>
                <sui-grid
                  divided="vertically"
                  style="margin:10px;padding:5px"
                  class="groupUserList"
                >
                  <sui-grid-row v-for="admin in group.users" :key="admin.id" style="padding:0px">
                    <sui-grid-column :width="10">
                      <div>{{admin.first_name}} {{admin.last_name}}</div>
                    </sui-grid-column>
                    <sui-grid-column :width="6" v-if="group.name=='All'">
                      <sui-dropdown text="Add to Group">
                        <sui-dropdown-menu>
                          <sui-dropdown-item
                            v-for="group in groups.filter(g=>g.name!='All')"
                            :key="group.name"
                            v-text="group.name"
                            @click="addToGroup(group, admin)"
                          ></sui-dropdown-item>
                        </sui-dropdown-menu>
                      </sui-dropdown>
                    </sui-grid-column>
                    <sui-grid-column :width="6" v-else>
                      <sui-button
                        class="pull-right"
                        icon="trash"
                        color="grey"
                        @click="removeFromGroup(group, admin)"
                      />
                    </sui-grid-column>
                  </sui-grid-row>
                </sui-grid>
              </sui-grid-column>
              <sui-grid-column :width="2">
                <sui-button
                  v-if="group.name!='All'"
                  icon="trash"
                  color="red"
                  @click="deleteGroup(group)"
                />
              </sui-grid-column>
            </sui-grid-row>
            <sui-grid-row>
              <sui-button content="New Group" color="green" @click="showingNewGroupModal = true"/>
            </sui-grid-row>
          </sui-grid>
          <!-- /Group List -->
        </sui-grid-column>
      </sui-grid-row>
    </sui-grid>

    <!-- New Group Modal -->
    <div>
      <sui-modal v-model="showingNewGroupModal" size="tiny">
        <sui-modal-header style="text-align:center">New Group
          <sui-icon class="pull-right" name="window close" @click="showingNewGroupModal=false"/>
        </sui-modal-header>
        <sui-modal-content>
          <sui-modal-description>
            <sui-input
              style="width:100%"
              placeholder="Enter a name for the group"
              v-model="newGroupName"
              @keyup.enter="createNewGroup()"
            />
          </sui-modal-description>
        </sui-modal-content>
        <sui-modal-actions style="padding:10px;text-align:center">
          <sui-button
            v-if="newGroupName!=''"
            class="green"
            @click="createNewGroup()"
            content="Create"
          />
        </sui-modal-actions>
      </sui-modal>
    </div>
    <!-- /New Group Modal -->
  </div>
</template>

<script>
import shared from "../globalState";
import util from "../util";
const REFRESH_POLL_RATE = 15000;

export default {
  data: () => ({
    admins: [],
    newAdminTag: "",
    tagError: "",
    global: shared.state,
    interval: null,
    groups: [],
    showingNewGroupModal: false,
    newGroupName: ""
  }),
  methods: {
    getAdmins: async function() {
      util.fetch.call(this, "/api/auth/admins/v1").then(result => {
        if (result.ok) {
          this.admins = result.theJson.administrators;
        } else {
          console.log("error retrieving admin data from /api/auth/admins/v1");
          console.log(result);
        }
      });
    },
    loadGroups: async function() {
      util.fetch.call(this, "/api/settings/groups").then(res => {
        this.groups = res.theJson;
      });
    },
    deleteGroup: function(group) {
      if (group.name == "All") {
        return;
      }
      this.groups.splice(this.groups.indexOf(group), 1);
      this.saveGroupData();
    },
    addToGroup: function(group, admin) {
      if (group.users.find(a => a.id == admin.id) == null) {
        this.groups[this.groups.indexOf(group)].users.push(admin);
        this.saveGroupData();
      }
    },
    removeFromGroup: function(group, admin) {
      group.users.splice(group.users.indexOf(admin), 1);
      this.saveGroupData();
    },
    createNewGroup: function() {
      this.groups.push({ name: this.newGroupName, users: [] });
      this.saveGroupData();
      this.newGroupName = "";
      this.showingNewGroupModal = false;
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
