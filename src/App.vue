<template>
  <div style="height:100% !important">
    <top-menu v-if="global.apiToken&&global.onboardStatus"/>
    <router-view style="margin-top:75px;height:100%;"/>
  </div>
</template>

<script>
import shared from "./globalState";
import util from "./util";
import focus from "vue-focus";
import moment from "moment";
import topMenu from "./menu/top.vue";

export default {
  data: () => ({
    global: shared.state
  }),
  methods: {
    authenticateUser: function() {
      util.fetch.call(this, "/api/auth/status/v1").then(result => {
        this.global.passwordSet = result.ok;
      });

      util.fetch.call(this, "/api/onboard/status/v1").then(result => {
        this.global.onboardStatus = result.theJson.status;
        if (this.global.onboardStatus !== "complete") {
          this.$router.push({ name: "welcome" });
        }
      });

      if (!this.global.apiToken) {
        this.$router.push({
          name: "loginTag",
          query: { forwardTo: this.$router.path }
        });
        return;
      }
    }
  },
  components: {
    "top-menu": topMenu
  },
  computed: {
    globalApiToken: function() {
      return this.global.apiToken;
    }
  },
  watch: {
    globalApiToken: function(next, prev) {
      if (!next && prev) {
        this.$router.push({
          name: "loginTag",
          query: { forwardTo: this.$route.path }
        });
      }
    }
  },
  mounted: function() {
    this.authenticateUser();
  }
};
</script>