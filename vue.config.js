module.exports = {
  devServer: {
    //while running HMR we need to connect to the bot's API
    proxy: "http://localhost:4096"
  }
};
