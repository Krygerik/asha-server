module.exports = {
  apps : [
    {
      name   : "prod",
      script : "./production/dist/index.js",
      env: {
          NODE_ENV: "production"
      }
    },
    {
      name   : "test",
      script : "./test/dist/index.js",
      env: {
        NODE_ENV: "development"
      }
    }
  ]
}
