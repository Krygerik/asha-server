import app from "./config/app";

const port = process.env.NODE_ENV == 'production'
    ? process.env.APP_PRODUCTION_PORT
    : process.env.APP_DEVELOPMENT_PORT

app.listen(port, () => {
    console.log('Express server listening on port ' + port);
})