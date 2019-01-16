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
            <div style="text-align:left">Login Code Words</div>
            <sui-input
              v-focus.lazy="true"
              style="width:100%"
              placeholder="code words"
              icon="lock"
              iconPosition="left"
              v-model="code"
              @keyup.enter="submit()"
            />
            <br>
            <sui-message color="red" style="width:100%" v-if="userMessage" v-text="userMessage"/>
            <div class="ui basic segment">
              <p>Please check your Forsta app for the login codewords you were just sent.</p>
            </div>
            <sui-button
              size="large"
              color="blue"
              content="Submit"
              @click="submit()"
              style="margin-top:10px;"
            />
            <router-link :to="{name: 'loginTag'}" class="ui large button code-cancel">Cancel</router-link>
          </sui-grid-column>
        </sui-grid-row>
      </sui-grid>
    </div>
  </div>
</template>

<script>
import shared from "../globalState";
import util from "../util";
import focus from "vue-focus"

export default {
  data: () => ({
    code: "",
    loading: false,
    global: shared.state,
    userMessage: null
  }),
  mounted: function() {
    if (!this.global.userId) {
      this.$router.push({ name: "loginTag", query: this.$route.query });
      return;
    }

    util.fetch.call(this, "/api/onboard/status/v1").then(result => {
      this.global.onboardStatus = result.theJson.status;
      if (this.global.onboardStatus !== "complete") {
        this.$router.push({ name: "welcome" });
      }
    });
  },
  methods: {
    submit: async function() {
      this.userMessage = null;
      if (code == "") {
        return;
      }
      var code = (this.code || "")
        .toLowerCase()
        .replace(/[^a-z ]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      this.code = code;
      this.loading = true;
      let result;
      try {
        result = await util.fetch.call(this, "/api/auth/login/v1", {
          method: "post",
          body: { id: this.global.userId, code }
        });
      } catch (err) {
        this.userMessage = Object.values(result)
          .map(x => (Array.isArray(x) ? x.join("; ") : x))
          .join("; ");
        return false;
      }
      this.loading = false;
      if (result.ok) {
        const { token } = result.theJson;
        this.global.apiToken = token;
        const forwardTo = this.$route.query.forwardTo;
        this.$router.replace(forwardTo || { name: "chat" });
        return false;
      } else {
        // scoop up all form/response error messages no matter the field(s) as a single string...
        this.userMessage = Object.values(result)
          .map(x => (Array.isArray(x) ? x.join("; ") : x))
          .join("; ");
      }
      return false;
    }
  },
  directives: {
    focus: focus.focus
  }
};
</script>
