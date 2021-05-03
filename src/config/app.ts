import * as bodyParser from "body-parser";
import * as cors from 'cors';
import * as express from "express";
import * as mongoose from "mongoose";
import {TestRoutes} from '../routes/testRoutes';
import {GameRoutes} from '../routes/gameRoutes';
import {CommonRoutes} from '../routes/commonRoutes';
import {DictionaryRoutes} from "../routes/dictionaryRoutes";

const database = process.env.NODE_ENV == 'production' ? 'production' : 'test';

class App {
    public app: express.Application;
    public mongoUrl: string = 'mongodb://AdminSokratik:Her0EsF!ve@localhost:27017/' + database;

    private testRoutes: TestRoutes = new TestRoutes();
    private gameRoutes: GameRoutes = new GameRoutes();
    private dictionaryRoutes: DictionaryRoutes = new DictionaryRoutes();
    private commonRoutes: CommonRoutes = new CommonRoutes();

    constructor() {
        this.app = express();
        this.config();
        this.mongoSetup();
        this.testRoutes.route(this.app);
        this.gameRoutes.route(this.app);
        this.dictionaryRoutes.route(this.app);
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
            this.mongoUrl,
            { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }
        )
    }
}

export default new App().app;
