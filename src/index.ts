import { createServer } from 'https';
import { readFileSync } from 'fs';
import app from "./config/app";
import {EEnvironment} from "./constants";

const port = process.env.NODE_ENV == EEnvironment.Production && 3001
    || process.env.NODE_ENV == EEnvironment.Test && 4001
    || 4000;

const server = process.env.NODE_ENV == 'production'
    ? createServer(
        {
            key: readFileSync('/etc/letsencrypt/live/asha-heroes.ru/privkey.pem'),
            cert: readFileSync('/etc/letsencrypt/live/asha-heroes.ru/fullchain.pem'),
        },
        app,
    )
    : app;

if (process.env.NODE_ENV !== EEnvironment.UnitTests) {
    server.listen(port, () => {
        console.log('Express server listening on port ' + port);
    })
}
