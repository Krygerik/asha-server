import app from "./config/app";

const port = process.env.NODE_ENV == 'production' ? 3000 : 4000

app.listen(port, () => {
    console.log('Express server listening on port ' + port);
})