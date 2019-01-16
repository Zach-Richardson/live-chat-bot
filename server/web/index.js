const api = require("./api");
const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
// const path = require('path');
const process = require("process");
const history = require("connect-history-api-fallback");
const root = `${__dirname}/../../dist`;

class WebServer {
  constructor(bot) {
    // require("dotenv").config();
    this.bot = bot;
    this.port = process.env.PORT || "4096";
    this.app = express();
    this.app.use(history());
    this.app.use(morgan("dev")); // logging
    this.app.use(bodyParser.json());
    this.app.use(
      "/api/onboard/",
      new api.OnboardAPIV1({ server: this }).router
    );
    this.app.use(
      "/api/auth/",
      new api.AuthenticationAPIV1({ server: this }).router
    );
    this.app.use(
      "/api/settings/",
      new api.SettingsAPIV1({ server: this }).router
    );
    if (process.env.NODE_ENV == "prod") {
      console.log("production mode detected, serving from live-chat-bot/dist");
      this.app.use("/fonts/*", (req, res) => {
        res.sendFile(req.baseUrl, { root });
      });
      this.app.use("/images/*", (req, res) => {
        res.sendFile(req.baseUrl, { root });
      });
      this.app.use("/img/*", (req, res) => {
        res.sendFile(req.baseUrl, { root });
      });
      this.app.use("*.js", (req, res) => {
        res.setHeader("Content-Type", "application/javascript");
        res.sendFile(req.baseUrl, { root });
      });
      this.app.use("*.css", (req, res) => {
        res.setHeader("Content-Type", "text/css");
        res.sendFile(req.baseUrl, { root });
      });
      this.app.use("/*", (_, res) => res.sendFile("index.html", { root }));
    }
    this.app.use((req, res, next) => {
      res.status(404).json({
        error: "bad_request",
        message: "not_found"
      });
    });
    this.app.use((error, req, res, next) => {
      res.status(500).json({
        error: "server",
        message: error
      });
    });
  }

  async start() {
    console.log(`Starting node server on port ${this.port}`);
    let server = await this.app.listen(this.port);
    var io = require("socket.io")(server);
    await this.bot.configureSocket(io);
  }
}

module.exports = WebServer;
