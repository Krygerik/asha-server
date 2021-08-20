import * as bodyParser from "body-parser";
import * as cors from 'cors';
import * as express from "express";
import * as mongoose from "mongoose";
import {AuthRoutes} from "../routes/authRoutes";
import {ClientLogsRoutes} from "../routes/clientLogsRoutes";
import {CommonRoutes} from '../routes/commonRoutes';
import {DictionaryRoutes} from "../routes/dictionaryRoutes";
import {GameRoutes} from '../routes/gameRoutes';
import {LadderRoutes} from "../routes/ladderRoutes";
import {TestRoutes} from '../routes/testRoutes';
import {TournamentRoutes} from "../routes/tournamentRoutes";
import { mongoUrl } from "../constants";

class App {
    public app: express.Application;
    private authRoutes: AuthRoutes = new AuthRoutes();
    private clientLogsRoutes: ClientLogsRoutes = new ClientLogsRoutes();
    private commonRoutes: CommonRoutes = new CommonRoutes();
    private dictionaryRoutes: DictionaryRoutes = new DictionaryRoutes();
    private gameRoutes: GameRoutes = new GameRoutes();
    private ladderRoutes: LadderRoutes = new LadderRoutes();
    private testRoutes: TestRoutes = new TestRoutes();
    private tournamentRoutes: TournamentRoutes = new TournamentRoutes();

    /**
     * Новые маршруты необходимо добавлять перед commonRoutes, т.к. он закроет все оставшиеся роуты
     */
    constructor() {
        this.app = express();
        this.config();
        this.mongoSetup();
        this.authRoutes.route(this.app);
        this.clientLogsRoutes.route(this.app);
        this.dictionaryRoutes.route(this.app);
        this.gameRoutes.route(this.app);
        this.ladderRoutes.route(this.app);
        this.testRoutes.route(this.app);
        this.tournamentRoutes.route(this.app);
        this.commonRoutes.route(this.app);
    }

    private config(): void {
        const corsOptions = {
            origin: '*',
            optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
        }
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cors(corsOptions));
    }

    private mongoSetup(): void {
        mongoose.connect(
            mongoUrl,
            { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }
        )
    }
}

export default new App().app;
