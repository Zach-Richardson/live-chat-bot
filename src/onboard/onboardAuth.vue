<template>
  <div class="ui main text container" style="margin-top: 80px;">
    <div class="ui container center aligned">
      <div class="ui basic segment">
        <h1>
          <i class="large circular sign in icon"></i>
          Enter Forsta {{label}}
        </h1>
      </div>
      <sui-grid class="ui centered huge">
        <sui-grid-row :class="{loading: loading}">
          <sui-grid-column :width="9" style="text-align:center">
            <div style="text-align:left">Forsta {{label}}</div>
            <sui-input
              v-focus.lazy="true"
              style="width:100%"
              placeholder="code words"
              icon="lock"
              iconPosition="left"
              v-model="secret"
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
            <router-link :to="{name: 'onboardTag'}" class="ui large button secret-cancel">Cancel</router-link>
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
export default {
  data: () => ({
    secret: "",
    otp: "",
    type: "",
    loading: false,
    error: "",
    global: shared.state,
    userMessage: null
  }),
  computed: {
    placeholder: function() {
      return this.type === "sms" ? "000000" : "password";
    },
    label: function() {
      return this.type === "sms" ? "SMS Code" : "Password";
    },
    inputType: function() {
      return this.type === "sms" ? "text" : "password";
    }
  },
  mounted: function() {
    this.type = this.$route.params.type;
  },
  methods: {
    validate: function() {
      if (!this.secret)
        return this.type === "sms"
          ? "SMS code is required."
          : "Password is required.";
      if (this.type === "sms")
        return this.secret.match(/^\d{6}$/)
          ? ""
          : "Please enter the 6-digit code you were sent.";
      if (this.type === "totp" && !this.otp)
        return "Authentication code is required.";
    },
    completeAuth() {
      this.error = this.validate();
      if (this.error) return;
      var tag = this.$route.params.tag;
      var value = this.secret;
      var type = this.type;
      var otp = this.otp;
      this.loading = true;
      const op = { method: "post", body: { value, type, otp } };
      util.fetch
        .call(this, "/api/onboard/atlasauth/complete/v1/" + tag, op)
        .then(result => {
          this.loading = false;
          if (result.ok) {
            const { token } = result.theJson;
            this.global.apiToken = token;
            this.global.onboardStatus = "complete";
            this.$router.push({ name: "welcome" });
            return false;
          } else {
            this.error =
              util.mergeErrors(result.theJson) ||
              "Internal error, please try again.";
            return false;
          }
        })
        .catch(err => {
          this.error =
            util.mergeErrors(err.theJson) ||
            "Internal error, please try again.";
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
