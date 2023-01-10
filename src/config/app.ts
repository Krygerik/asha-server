import * as bodyParser from "body-parser";
import * as cors from 'cors';
import * as session from 'express-session';
import * as express from "express";
import * as mongoose from "mongoose";
import * as passport from "passport";
import { AccountRoutes } from "../routes/account-routes";
import {ClientLogsRoutes} from "../routes/clientLogsRoutes";
import {CommonRoutes} from '../routes/commonRoutes';
import {DictionaryRoutes} from "../routes/dictionaryRoutes";
import {GameRoutes} from '../routes/gameRoutes';
import {LadderRoutes} from "../routes/ladderRoutes";
import { MapVersionRoutes } from "../routes/mapVersionRoutes";
import {TestRoutes} from '../routes/testRoutes';
import {TournamentRoutes} from "../routes/tournamentRoutes";
import { mongoUrl } from "../constants";
import 'dotenv/config';

class App {
    public app: express.Application;
    private accountRoutes: AccountRoutes = new AccountRoutes();
    private clientLogsRoutes: ClientLogsRoutes = new ClientLogsRoutes();
    private commonRoutes: CommonRoutes = new CommonRoutes();
    private dictionaryRoutes: DictionaryRoutes = new DictionaryRoutes();
    private gameRoutes: GameRoutes = new GameRoutes();
    private ladderRoutes: LadderRoutes = new LadderRoutes();
    private mapVersionRoutes: MapVersionRoutes = new MapVersionRoutes();
    private testRoutes: TestRoutes = new TestRoutes();
    private tournamentRoutes: TournamentRoutes = new TournamentRoutes();

    /**
     * Новые маршруты необходимо добавлять перед commonRoutes, т.к. он закроет все оставшиеся роуты
     */
    constructor() {
        this.app = express();
        this.config();
        this.mongoSetup();
        this.accountRoutes.route(this.app);
        this.clientLogsRoutes.route(this.app);
        this.dictionaryRoutes.route(this.app);
        this.gameRoutes.route(this.app);
        this.ladderRoutes.route(this.app);
        this.mapVersionRoutes.route(this.app);
        this.testRoutes.route(this.app);
        this.tournamentRoutes.route(this.app);
        this.commonRoutes.route(this.app);
    }

    private config(): void {
        const corsOptions = {
            origin: '*',
            optionsSuccessStatus: 200
        }
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cors(corsOptions));
        this.app.use(session({
            secret: process.env.APP_SESSION_SECRET,
            cookie: {
                maxAge: 60000 * 60 * 24
            },
        }));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
    }

    private mongoSetup(): void {
        mongoose.connect(
            mongoUrl,
            {
                useCreateIndex: true,
                useFindAndModify: false,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        )
    }
}

export default new App().app;
