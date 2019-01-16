<template>
  <div class="ui main text container" style="margin-top: 100px;">
    <div class="ui container center aligned">
      <div class="ui basic segment huge">
        <h1 class="ui header">
          <i class="circular icon user"></i>
          Live Chat Bot Login
        </h1>
      </div>
      <sui-grid class="ui centered huge">
        <sui-grid-row>
          <sui-grid-column :width="9" style="text-align:center">
            <div style="text-align:left">Authorized User</div>
            <sui-input
              style="width:100%"
              placeholder="user.name:org.name"
              icon="at"
              iconPosition="left"
              v-model="tag"
              @keyup.enter="submit()"
            />
            <br>
            <sui-message color="red" style="width:100%" v-if="userMessage" v-text="userMessage"/>
            <div class="ui basic segment">
              <p>Please enter your Forsta address tag to receive login codewords for this site.</p>
            </div>
            <sui-button
              size="large"
              color="blue"
              content="Submit"
              @click="submit()"
              style="margin-top:10px;"
            />
          </sui-grid-column>
        </sui-grid-row>
      </sui-grid>
    </div>
  </div>
</template>

<script>
import shared from "../globalState";
import util from "../util";
import focus from "vue-focus";
import jwtDecode from "jwt-decode";

export default {
  data: () => ({
    global: shared.state,
    tag: "",
    loading: false,
    userMessage: null
  }),
  computed: {},
  mounted: function() {
    const apiToken = this.global.apiToken;
    const forwardTo = this.$route.query.forwardTo;
    if (apiToken) {
      const decoded = jwtDecode(apiToken);
      const expires = new Date(decoded.exp * 1000);
      const now = new Date();

      if (now < expires) {
        this.$router.replace(forwardTo ? forwardTo : { name: "welcome" });
        return;
      }
    }

    util.fetch.call(this, "/api/onboard/status/v1").then(result => {
      this.global.onboardStatus = result.theJson.status;
      if (this.global.onboardStatus !== "complete") {
        this.$router.push({ name: "welcome" });
      }
    });
  },
  methods: {
    submit: function requestAuth() {
      this.userMessage = null;
      const tagRegex = /[0-9a-z]+[.]{1}[0-9a-z]+[:]{1}[0-9a-z]+[.]{1}[0-9a-z]+/;
      console.log(!tagRegex.test(this.tag));
      if (!tagRegex.test(this.tag)) {
        this.userMessage =
          "Login credentials should be in the form user.name:org.name";
        return;
      }
      this.loading = true;
      util.fetch
        .call(this, "/api/auth/login/v1/" + this.tag)
        .then(result => {
          this.loading = false;
          if (result.ok) {
            const userId = result.theJson.id;
            this.global.userId = userId;
            this.global.loginTag = this.tag;
            this.$router.push({ name: "loginCode", query: this.$route.query });
            return false;
          } else {
            this.userMessage = "User not found";
            return false;
          }
        })
        .catch(err => {
          console.log("got an err in requestAuth", err);
          this.loading = false;
        });
      return false;
    }
  },
  directives: {
    focus: focus.focus
  }
};
</script>
