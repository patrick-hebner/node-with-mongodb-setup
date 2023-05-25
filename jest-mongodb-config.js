module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: "6.0.5", //Change this to your mongo db version
      skipMD5: true,
    },
    autoStart: false,
    instance: {},
  },
};
