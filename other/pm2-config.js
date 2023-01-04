module.exports = {
  apps : [
    {
      name   : "prod",
      script : "./production/dist/index.js",
      env: {
          NODE_ENV: "production",
          APP_PRODUCTION_PORT: 3000,
          APP_DEVELOPMENT_PORT: 4000,
          APP_DISCORD_CLIENT_ID: 929926537422192741,
          APP_DISCORD_CLIENT_SECRET: '1zSEsXy-xuRh3IzaKahhi5bmuU2bA0aM',
          APP_DEVELOP_CLIENT_ROOT_PAGE: 'http://localhost:3000',
          APP_PRODUCTION_CLIENT_ROOT_PAGE: 'http://45.141.101.120',
          APP_SESSION_SECRET: 'xuRh3IzaKahhi5b'
      }
    },
    {
      name   : "test",
      script : "./test/dist/index.js",
      env: {
        NODE_ENV: "development",
        APP_PRODUCTION_PORT: 3000,
        APP_DEVELOPMENT_PORT: 4000,
        APP_DISCORD_CLIENT_ID: 929926537422192741,
        APP_DISCORD_CLIENT_SECRET: '1zSEsXy-xuRh3IzaKahhi5bmuU2bA0aM',
        APP_DEVELOP_CLIENT_ROOT_PAGE: 'http://localhost:3000',
        APP_PRODUCTION_CLIENT_ROOT_PAGE: 'http://45.141.101.120:8080',
        APP_SESSION_SECRET: 'xuRh3IzaKahhi5b'
      }
    }
  ]
}
