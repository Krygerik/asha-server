import { createServer } from 'https';
import { readFileSync } from 'fs';
import app from "./config/app";

const port = process.env.NODE_ENV == 'production' ? 3001 : 4000

const server = process.env.NODE_ENV == 'production'
    ? createServer(
        {
            key: readFileSync('/etc/letsencrypt/live/asha-heroes.ru/privkey.pem'),
            cert: readFileSync('/etc/letsencrypt/live/asha-heroes.ru/fullchain.pem'),
        },
        app,
    )
    : app;

server.listen(port, () => {
    console.log('Express server listening on port ' + port);
})